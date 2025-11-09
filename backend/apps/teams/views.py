from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from apps.accounts.permissions import IsCoach, IsCoordinator
from apps.teams.models import Division, Team, TeamMembership
from apps.teams.serializers import (
    DivisionSerializer,
    JoinTeamSerializer,
    TeamMembershipSerializer,
    TeamSerializer,
)


class DivisionViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer
    permission_classes = [IsAuthenticated]


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Team.objects.select_related("division")
        if user.role in {"coordinator", "admin"}:
            return queryset
        if user.role == "coach":
            return queryset.filter(memberships__user=user, memberships__role="coach")
        if user.role == "player":
            profile = getattr(user, "playerprofile", None)
            if profile and profile.team_id:
                return queryset.filter(id=profile.team_id)
            return queryset.none()
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in {"coach", "coordinator", "admin"}:
            raise PermissionDenied("Only coaches and coordinators can create teams.")
        team = serializer.save(created_by=user)
        TeamMembership.objects.get_or_create(
            team=team,
            user=user,
            role="coach",
            defaults={"is_approved": True},
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        serializer = JoinTeamSerializer(
            data={"team_id": pk},
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        return Response(
            TeamMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsCoordinator],
        url_path="approve-coach",
    )
    def approve_coach(self, request, pk=None):
        team = self.get_object()
        coach_id = request.data.get("coach_id")
        membership = TeamMembership.objects.filter(team=team, user_id=coach_id, role="coach").first()
        if not membership:
            return Response({"detail": "Coach not found."}, status=status.HTTP_404_NOT_FOUND)
        membership.is_approved = True
        membership.save(update_fields=["is_approved"])
        return Response(TeamMembershipSerializer(membership).data)
