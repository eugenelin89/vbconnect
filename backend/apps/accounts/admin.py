from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role Details", {"fields": ("role", "bio", "is_role_verified")}),
    )
    list_display = ("email", "role", "is_staff", "is_role_verified")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)

