"""
Health check. Run from the backend folder:   python check_setup.py
Prints OK / FIX lines so you can see what is wrong BEFORE starting the server.
It never prints your passwords or secrets.
"""
import os
import sys
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
import django
django.setup()
from django.conf import settings
from django.db import connection

problems = 0


def report(ok, message):
    global problems
    problems += 0 if ok else 1
    print(('  OK   ' if ok else '  FIX  ') + message)


print('\n1) .env file')
report((Path(settings.BASE_DIR) / '.env').exists(), '.env found in the backend folder')

print('\n2) Database')
db = settings.DATABASES['default']
aiven = bool(os.environ.get('AIVEN_DB_HOST'))
print('  Using:', 'AIVEN cloud' if aiven else 'LOCAL database', '->', db.get('HOST', ''), db.get('PORT', ''), db['NAME'])
if aiven:
    ca = db.get('OPTIONS', {}).get('ssl', {}).get('ca')
    if ca:
        report(Path(ca).exists(), 'certificate file found: ' + str(ca))
    else:
        report(False, 'no SSL CA certificate found (put ca.pem in backend/certs/ca.pem)')
try:
    connection.ensure_connection()
    report(True, 'connected to the database')
except Exception as exc:  # noqa: BLE001 - we want to show any problem plainly
    report(False, 'cannot connect: ' + str(exc)[:200])
    if not aiven:
        print('        Tip: is WAMP green? Does database shopsphere_db exist in Workbench?')

print('\n3) Google login')
cid, secret = settings.GOOGLE_CLIENT_ID, settings.GOOGLE_CLIENT_SECRET
report(cid.endswith('.apps.googleusercontent.com'), 'GOOGLE_CLIENT_ID is filled in (ends with .apps.googleusercontent.com)')
report(bool(secret) and not secret.startswith('<'), 'GOOGLE_CLIENT_SECRET is filled in')
expected = 'http://127.0.0.1:8000/api/auth/google/callback/'
report(settings.GOOGLE_REDIRECT_URI == expected, 'redirect address is ' + settings.GOOGLE_REDIRECT_URI)
print('  Reminder: this exact address must also be listed in Google Cloud Console.')

print('\n' + ('All good. Next: python manage.py migrate' if not problems else '%d item(s) marked FIX above. Fix them, then run this check again.' % problems))
sys.exit(1 if problems else 0)
