from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

User = get_user_model()


@dataclass
class CreateUserPayload:
    email: str
    password: str
    first_name: str
    last_name: str
    role: str
    bio: Optional[str] = ""


def _generate_username(email: str) -> str:
    base = email.split("@")[0].replace("+", ".")
    candidate = base
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        candidate = f"{base}{suffix}"
        suffix += 1
    return candidate


@transaction.atomic
def create_user(payload: CreateUserPayload) -> User:
    username = _generate_username(payload.email.lower())
    try:
        user = User.objects.create_user(
            username=username,
            email=payload.email.lower(),
            password=payload.password,
            first_name=payload.first_name,
            last_name=payload.last_name,
            role=payload.role,
            bio=payload.bio or "",
        )
    except IntegrityError as exc:
        raise ValueError("Unable to create user with provided credentials") from exc

    if user.require_staff_capabilities():
        user.is_staff = True
        user.is_role_verified = False
        user.save(update_fields=["is_staff", "is_role_verified"])

    return user

