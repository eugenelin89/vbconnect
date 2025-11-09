from __future__ import annotations

from django.conf import settings
from django.db import models


class TrainingLog(models.Model):
    ACTIVITY_CHOICES = [
        ("throwing", "Throwing"),
        ("hitting", "Hitting"),
        ("running", "Running"),
        ("strength", "Strength"),
        ("mobility", "Mobility"),
    ]

    profile = models.ForeignKey(
        "players.PlayerProfile",
        on_delete=models.CASCADE,
        related_name="training_logs",
    )
    activity_type = models.CharField(max_length=32, choices=ACTIVITY_CHOICES)
    duration_minutes = models.PositiveIntegerField()
    date = models.DateField()
    notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="training_verifications",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    @property
    def is_verified(self) -> bool:
        return self.verified_by is not None

