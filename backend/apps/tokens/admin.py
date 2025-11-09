from django.contrib import admin

from apps.tokens.models import TokenTransaction


@admin.register(TokenTransaction)
class TokenTransactionAdmin(admin.ModelAdmin):
    list_display = ("profile", "amount", "reason", "created_at")
    search_fields = ("profile__user__email", "reason")
    list_filter = ("created_at",)

