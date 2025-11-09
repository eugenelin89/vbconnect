from __future__ import annotations

from django.conf import settings
from django.db import models


class Division(models.Model):
    LEAGUE_CHOICES = [
        ("minor", "Vancouver Minor Baseball"),
        ("community", "Vancouver Community Baseball"),
    ]

    name = models.CharField(max_length=128, unique=True)
    league_type = models.CharField(max_length=32, choices=LEAGUE_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    division = models.ForeignKey(Division, on_delete=models.CASCADE, related_name="teams")
    name = models.CharField(max_length=128)
    season_year = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_teams",
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("division", "name", "season_year")

    def __str__(self):
        return f"{self.name} ({self.season_year})"

    @property
    def roster_count(self) -> int:
        return self.players.count()


class TeamMembership(models.Model):
    class Roles(models.TextChoices):
        COACH = "coach", "Coach"
        PLAYER = "player", "Player"
        PARENT = "parent", "Parent"

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=16, choices=Roles.choices)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("team", "user", "role")

    def __str__(self):
        return f"{self.user.display_name} -> {self.team} ({self.role})"
