import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_register_creates_user(django_user_model):
    client = APIClient()
    payload = {
        "email": "player@example.com",
        "password": "StrongPass123",
        "first_name": "Test",
        "last_name": "Player",
        "role": "player",
    }

    response = client.post(reverse("auth-register"), payload, format="json")

    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["email"] == payload["email"]
    assert django_user_model.objects.filter(email=payload["email"]).exists()

