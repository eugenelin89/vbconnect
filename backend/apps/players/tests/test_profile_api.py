import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_player_can_update_profile(django_user_model):
    user = django_user_model.objects.create_user(
        username="player1",
        email="player1@example.com",
        password="StrongPass123",
        role="player",
    )
    client = APIClient()
    client.force_authenticate(user)

    response = client.put(
        "/api/profile/",
        {
            "position": "Pitcher",
            "bats": "R",
            "throws": "R",
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["position"] == "Pitcher"
