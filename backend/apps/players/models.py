from __future__ import annotations

from django.conf import settings
from django.db import models


class PlayerProfile(models.Model):
    BATS_CHOICES = [("R", "Right"), ("L", "Left"), ("S", "Switch")]
    THROWS_CHOICES = [("R", "Right"), ("L", "Left")]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    team = models.ForeignKey(
        "teams.Team",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="players",
    )
    position = models.CharField(max_length=64, blank=True)
    bats = models.CharField(max_length=1, choices=BATS_CHOICES, blank=True)
    throws = models.CharField(max_length=1, choices=THROWS_CHOICES, blank=True)
    height_cm = models.PositiveIntegerField(null=True, blank=True)
    weight_kg = models.PositiveIntegerField(null=True, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    school = models.CharField(max_length=128, blank=True)
    avatar_url = models.URLField(blank=True)
    public_profile = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__last_name"]

    def __str__(self):
        return self.user.display_name


class PerformanceMetric(models.Model):
    METRIC_CHOICES = [
        ("fastball_velocity", "Fastball Velocity"),
        ("exit_velocity", "Exit Velocity"),
        ("pop_time", "Pop Time"),
        ("sixty_yard_dash", "60 Yard Dash"),
    ]

    profile = models.ForeignKey(
        PlayerProfile, on_delete=models.CASCADE, related_name="metrics"
    )
    metric_type = models.CharField(max_length=64, choices=METRIC_CHOICES)
    value = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=32, default="")
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_metrics",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("profile", "metric_type")

    @property
    def is_verified(self) -> bool:
        return bool(self.verified_by and self.verified_at)

