"""
Google login for ShopSphere (OAuth 2.0 "authorization code" flow).

How it works (the 6 steps your client will see):
  1. The shopper clicks "Continue with Google" in the React app.
  2. React sends the browser to  GET /api/auth/google/login/
  3. We redirect the browser to Google's sign-in page.
  4. Google redirects back to     GET /api/auth/google/callback/?code=...
  5. We swap that one-time code for the shopper's verified email + name,
     find (or create) their ShopSphere account, and issue our normal JWT.
  6. We send the browser back to the React app, which stores the JWT
     exactly like a normal sign-in. Cart, orders and wishlist work as usual.

No extra packages are needed: only Python's standard library is used.
Secrets are read from backend/.env and are never sent to the browser.
"""
import json
import re
import secrets
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.views import View
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
TOKEN_URL = 'https://oauth2.googleapis.com/token'
USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

STATE_COOKIE = 'g_oauth_state'   # proves the callback belongs to the browser that started it
NEXT_COOKIE = 'g_oauth_next'     # where to send the shopper after sign-in (e.g. /cart)
COOKIE_AGE = 600                 # 10 minutes is plenty to finish signing in


# ---------------------------------------------------------------- helpers
def _post_form(url, data):
    """POST form-encoded data, return the JSON reply (raises on any failure)."""
    req = Request(url, data=urlencode(data).encode(), method='POST',
                  headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def _get_json(url, bearer):
    req = Request(url, headers={'Authorization': f'Bearer {bearer}'})
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def _safe_next(value):
    """Only allow same-site paths like /cart. Blocks https://evil.com tricks."""
    if value and value.startswith('/') and not value.startswith('//') and '\\' not in value:
        return value[:200]
    return '/'


def _back_to_frontend(path):
    return HttpResponseRedirect(settings.FRONTEND_URL.rstrip('/') + path)


def _fail(code):
    """Send the shopper back to /signin with a friendly error code."""
    response = _back_to_frontend(f'/signin?{urlencode({"google_error": code})}')
    response.delete_cookie(STATE_COOKIE)
    response.delete_cookie(NEXT_COOKIE)
    return response


def _unique_username(email):
    base = re.sub(r'[^\w.@+-]', '', email.split('@')[0])[:30] or 'shopper'
    username, n = base, 1
    while User.objects.filter(username__iexact=username).exists():
        n += 1
        username = f'{base}{n}'
    return username


def _get_or_create_user(email, info):
    """Same email = same account (even if it was first created with a password)."""
    user = User.objects.filter(email__iexact=email).first()
    if user:
        return user
    user = User(
        username=_unique_username(email),
        email=email,
        first_name=(info.get('given_name') or '')[:150],
        last_name=(info.get('family_name') or '')[:150],
    )
    user.set_unusable_password()   # Google users sign in with Google, not a password
    user.save()
    return user


# ------------------------------------------------------------------ views
class GoogleLoginView(View):
    """GET /api/auth/google/login/  ->  redirects the browser to Google."""

    def get(self, request):
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return _fail('not_configured')

        state = secrets.token_urlsafe(32)
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'prompt': 'select_account',
        }
        response = HttpResponseRedirect(f'{AUTH_URL}?{urlencode(params)}')
        cookie_opts = dict(max_age=COOKIE_AGE, httponly=True, samesite='Lax',
                           secure=request.is_secure())
        response.set_cookie(STATE_COOKIE, state, **cookie_opts)
        response.set_cookie(NEXT_COOKIE, _safe_next(request.GET.get('next')), **cookie_opts)
        return response


class GoogleCallbackView(View):
    """GET /api/auth/google/callback/  <- Google sends the shopper back here."""

    def get(self, request):
        if request.GET.get('error'):                       # shopper pressed "Cancel"
            return _fail('access_denied')

        state = request.GET.get('state', '')
        saved = request.COOKIES.get(STATE_COOKIE, '')
        if not state or not saved or not secrets.compare_digest(state, saved):
            return _fail('invalid_state')

        code = request.GET.get('code')
        if not code:
            return _fail('missing_code')

        try:
            tokens = _post_form(TOKEN_URL, {
                'code': code,
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'redirect_uri': settings.GOOGLE_REDIRECT_URI,
                'grant_type': 'authorization_code',
            })
            info = _get_json(USERINFO_URL, tokens['access_token'])
        except (HTTPError, URLError, KeyError, ValueError, TimeoutError):
            return _fail('google_unreachable')

        email = (info.get('email') or '').strip().lower()
        verified = info.get('email_verified') in (True, 'true', 'True')
        if not email or not verified:
            return _fail('email_not_verified')

        user = _get_or_create_user(email, info)
        if not user.is_active:
            return _fail('account_disabled')

        refresh = RefreshToken.for_user(user)
        next_path = _safe_next(request.COOKIES.get(NEXT_COOKIE))

        # Tokens travel in the URL *fragment* (#...), which browsers never send
        # to any server and which does not end up in server logs.
        fragment = urlencode({'access': str(refresh.access_token),
                              'refresh': str(refresh), 'next': next_path})
        response = _back_to_frontend(f'/auth/google/callback#{fragment}')
        response.delete_cookie(STATE_COOKIE)
        response.delete_cookie(NEXT_COOKIE)
        return response
