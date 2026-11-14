from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — extends Django's AbstractUser (so it keeps the
    "default id" auto-increment primary key, is_staff/is_superuser flags
    used for admin authorization, password hashing, etc.) with e-commerce
    shipping fields.
    """
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
