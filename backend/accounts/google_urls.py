from django.urls import path
from .google_oauth import GoogleLoginView, GoogleCallbackView

# Mounted at /api/auth/  (see ecommerce_backend/urls.py)
urlpatterns = [
    path('google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('google/callback/', GoogleCallbackView.as_view(), name='google_callback'),
]
