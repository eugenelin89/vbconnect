from __future__ import annotations

from django.conf import settings
from django.db import models


class TokenTransaction(models.Model):
    profile = models.ForeignKey(
        "players.PlayerProfile",
        on_delete=models.CASCADE,
        related_name="token_transactions",
    )
    amount = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.profile} {self.amount} tokens"

    @staticmethod
    def balance_for_profile(profile) -> int:
        return profile.token_transactions.aggregate(total=models.Sum("amount")).get("total") or 0

