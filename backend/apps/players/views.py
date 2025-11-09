from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCoach
from apps.players.models import PerformanceMetric, PlayerProfile
from apps.players.serializers import (
    OwnPlayerProfileSerializer,
    PerformanceMetricSerializer,
    PlayerProfileSerializer,
)


class PlayerProfileViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = PlayerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PlayerProfile.objects.select_related("user", "team")
        user = self.request.user
        if user.role in {"coach", "coordinator", "admin"}:
            team_id = self.request.query_params.get("team")
            if team_id:
                queryset = queryset.filter(team_id=team_id)
            return queryset
        return queryset.filter(user=user)


class OwnPlayerProfileAPIView(APIView):
    def get(self, request):
        serializer = OwnPlayerProfileSerializer(request.user.playerprofile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.playerprofile
        serializer = OwnPlayerProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@method_decorator(cache_control(private=True, max_age=30), name="dispatch")
class PerformanceMetricViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PerformanceMetricSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = PerformanceMetric.objects.select_related("profile", "verified_by")
        profile_id = self.request.query_params.get("profile")
        if user.role in {"coach", "coordinator", "admin"}:
            if profile_id:
                queryset = queryset.filter(profile_id=profile_id)
            return queryset
        return queryset.filter(profile__user=user)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsCoach],
    )
    def verify(self, request, pk=None):
        metric = self.get_object()
        serializer = self.get_serializer(metric)
        serializer.verify(user=request.user)
        return Response(self.get_serializer(metric).data, status=status.HTTP_200_OK)

