from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.players.models import PerformanceMetric, PlayerProfile


class PlayerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PlayerProfile
        fields = [
            "id",
            "user",
            "team",
            "position",
            "bats",
            "throws",
            "height_cm",
            "weight_kg",
            "graduation_year",
            "school",
            "avatar_url",
            "public_profile",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OwnPlayerProfileSerializer(PlayerProfileSerializer):
    user = UserSerializer(read_only=True)


class PerformanceMetricSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = PerformanceMetric
        fields = [
            "id",
            "profile",
            "metric_type",
            "value",
            "unit",
            "verified_by",
            "verified_at",
            "is_verified",
            "created_at",
        ]
        read_only_fields = ["verified_by", "verified_at", "is_verified", "created_at", "profile"]

    def create(self, validated_data):
        request = self.context["request"]
        profile = getattr(request.user, "playerprofile", None)
        if not profile:
            raise serializers.ValidationError("Only players can create metrics.")
        return PerformanceMetric.objects.update_or_create(
            profile=profile,
            metric_type=validated_data["metric_type"],
            defaults=validated_data,
        )[0]

    def verify(self, *, user):
        metric: PerformanceMetric = self.instance
        metric.verified_by = user
        metric.verified_at = timezone.now()
        metric.save(update_fields=["verified_by", "verified_at"])
        return metric

