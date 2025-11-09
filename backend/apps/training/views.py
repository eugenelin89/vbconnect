from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCoach
from apps.players.models import PerformanceMetric
from apps.training.models import TrainingLog
from apps.training.serializers import TrainingLogSerializer


class TrainingLogViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = TrainingLogSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = TrainingLog.objects.select_related("profile", "profile__user", "profile__team")
        if user.role == "player":
            return queryset.filter(profile__user=user)
        if user.role in {"coach", "coordinator", "admin"}:
            return queryset.filter(profile__team__memberships__user=user).distinct()
        if user.role == "parent":
            return queryset.none()
        return queryset

    @action(detail=True, methods=["post"], permission_classes=[IsCoach])
    def verify(self, request, pk=None):
        log = self.get_object()
        serializer = self.get_serializer(log)
        serializer.verify(user=request.user)
        return Response(self.get_serializer(log).data, status=status.HTTP_200_OK)


class VerificationAPIView(APIView):
    permission_classes = [IsCoach]

    def post(self, request):
        entity_type = request.data.get("entity_type")
        entity_id = request.data.get("entity_id")
        if entity_type == "training":
            log = TrainingLog.objects.get(id=entity_id)
            serializer = TrainingLogSerializer(log)
            serializer.verify(user=request.user)
            return Response(TrainingLogSerializer(log).data)
        if entity_type == "metric":
            metric = PerformanceMetric.objects.get(id=entity_id)
            from apps.players.serializers import PerformanceMetricSerializer

            serializer = PerformanceMetricSerializer(metric)
            serializer.verify(user=request.user)
            return Response(PerformanceMetricSerializer(metric).data)
        return Response({"detail": "Unsupported entity type."}, status=status.HTTP_400_BAD_REQUEST)
