from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        PLAYER = "player", "Player"
        COACH = "coach", "Coach"
        COORDINATOR = "coordinator", "Coordinator"
        PARENT = "parent", "Parent"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=32, choices=Roles.choices, default=Roles.PLAYER)
    bio = models.TextField(blank=True)
    is_role_verified = models.BooleanField(
        default=False,
        help_text="Coaches and coordinators require verification before elevated actions.",
    )

    def __str__(self) -> str:
        return f"{self.get_full_name()} ({self.role})" if self.get_full_name() else self.email

    @property
    def display_name(self) -> str:
        return self.get_full_name() or self.username

    def require_staff_capabilities(self) -> bool:
        return self.role in {self.Roles.COORDINATOR, self.Roles.ADMIN}

