from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from apps.training.models import TrainingLog


class TrainingLogSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = TrainingLog
        fields = [
            "id",
            "profile",
            "activity_type",
            "duration_minutes",
            "date",
            "notes",
            "verified_by",
            "verified_at",
            "is_verified",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "profile",
            "verified_by",
            "verified_at",
            "is_verified",
            "created_at",
        ]

    def create(self, validated_data):
        profile = self.context["request"].user.playerprofile
        return TrainingLog.objects.create(profile=profile, **validated_data)

    def verify(self, *, user):
        log: TrainingLog = self.instance
        log.verified_by = user
        log.verified_at = timezone.now()
        log.save(update_fields=["verified_by", "verified_at"])
        return log

