from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsCoach
from apps.achievements.models import PlayerAchievement
from apps.achievements.serializers import (
    AwardAchievementSerializer,
    PlayerAchievementSerializer,
)


class PlayerAchievementViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = PlayerAchievementSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = PlayerAchievement.objects.select_related("achievement", "profile", "profile__user")
        if user.role in {"coach", "coordinator", "admin"}:
            team_id = self.request.query_params.get("team")
            if team_id:
                queryset = queryset.filter(profile__team_id=team_id)
            return queryset
        return queryset.filter(profile__user=user)

    @action(detail=False, methods=["post"], permission_classes=[IsCoach], url_path="award")
    def award(self, request):
        serializer = AwardAchievementSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        award = serializer.save()
        return Response(
            PlayerAchievementSerializer(award).data,
            status=status.HTTP_201_CREATED,
        )

