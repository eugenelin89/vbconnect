from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from apps.teams.models import Division, Team, TeamMembership
from apps.teams.services import attach_user_to_team


class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ["id", "name", "league_type", "description"]


class TeamSerializer(serializers.ModelSerializer):
    division_detail = DivisionSerializer(source="division", read_only=True)
    roster_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "division",
            "division_detail",
            "season_year",
            "description",
            "roster_count",
            "created_at",
        ]
        read_only_fields = ["id", "division_detail", "roster_count", "created_at"]


class TeamMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMembership
        fields = ["id", "team", "user", "role", "is_approved", "created_at"]
        read_only_fields = ["id", "is_approved", "created_at"]


class JoinTeamSerializer(serializers.Serializer):
    team_id = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all(), source="team")

    def save(self, **kwargs):
        request = self.context["request"]
        user = request.user
        team: Team = self.validated_data["team"]

        membership, _ = TeamMembership.objects.get_or_create(
            user=user,
            team=team,
            role="player" if user.role == "player" else "parent",
        )
        membership.is_approved = user.role != "player"
        membership.save()

        if user.role == "player":
            attach_user_to_team(user, team)

        return membership
