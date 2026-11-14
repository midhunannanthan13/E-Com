import os
from django.core.wsgi import get_wsgi_application

# In production (Vercel/Render), DJANGO_SETTINGS_MODULE is set to
# ecommerce_backend.production via environment variable.
# Locally it falls back to the normal settings.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
application = get_wsgi_application()

# Vercel expects the WSGI callable to be named "app"
app = application
