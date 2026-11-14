"""
ShopSphere – Production settings (used by Vercel and Render).

This file imports everything from settings.py and then overrides only
what must change in production.  Vercel sets:
    DJANGO_SETTINGS_MODULE=ecommerce_backend.production
"""
from .settings import *   # noqa: F401, F403  (intentional star-import)
import os

# ------------------------------------------------------------------
# Security
# ------------------------------------------------------------------
DEBUG = False

SECRET_KEY = os.environ['SECRET_KEY']       # required – will error if missing

ALLOWED_HOSTS = [
    '.vercel.app',
    '.onrender.com',
    'localhost',
    '127.0.0.1',
]

# Allow extra hosts set via env  (e.g. your custom domain)
extra_hosts = os.environ.get('ALLOWED_HOSTS', '')
if extra_hosts:
    for h in extra_hosts.split(','):
        if h.strip():
            ALLOWED_HOSTS.append(h.strip())

# ------------------------------------------------------------------
# Static files  (WhiteNoise serves them directly from Vercel/Gunicorn)
# ------------------------------------------------------------------
STATIC_ROOT = BASE_DIR / 'staticfiles'   # noqa: F405  (BASE_DIR from settings.py)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ------------------------------------------------------------------
# CORS – also allow the production frontend URL
# ------------------------------------------------------------------
_frontend = os.environ.get('FRONTEND_URL', '')
if _frontend and _frontend not in CORS_ALLOWED_ORIGINS:   # noqa: F405
    CORS_ALLOWED_ORIGINS.append(_frontend)               # noqa: F405

if _frontend and _frontend not in CSRF_TRUSTED_ORIGINS:   # noqa: F405
    CSRF_TRUSTED_ORIGINS.append(_frontend)               # noqa: F405
