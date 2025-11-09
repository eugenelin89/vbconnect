from __future__ import annotations

from django.conf import settings
from django.db import models


class Achievement(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=128)
    description = models.TextField()
    token_reward = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class PlayerAchievement(models.Model):
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    profile = models.ForeignKey(
        "players.PlayerProfile",
        on_delete=models.CASCADE,
        related_name="achievements",
    )
    awarded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    awarded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ("achievement", "profile")
        ordering = ["-awarded_at"]

    def __str__(self):
        return f"{self.profile} - {self.achievement}"

