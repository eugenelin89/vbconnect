import pytest
from rest_framework.test import APIClient

from apps.teams.models import Division, Team


@pytest.mark.django_db
def test_coach_can_create_team(django_user_model):
    coach = django_user_model.objects.create_user(
        username="coach1",
        email="coach1@example.com",
        password="StrongPass123",
        role="coach",
    )
    division = Division.objects.create(name="13U A", league_type="minor")
    client = APIClient()
    client.force_authenticate(coach)

    payload = {
        "name": "Vancouver Eagles",
        "season_year": 2025,
        "division": division.id,
    }

    response = client.post("/api/teams/", payload, format="json")

    assert response.status_code == 201
    assert Team.objects.filter(name="Vancouver Eagles").exists()
