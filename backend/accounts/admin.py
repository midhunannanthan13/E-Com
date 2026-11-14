from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Shipping info', {'fields': ('phone', 'address', 'city', 'postal_code', 'country')}),
    )
    list_display = ('username', 'email', 'is_staff', 'is_active')
