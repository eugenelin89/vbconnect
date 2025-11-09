from __future__ import annotations

from rest_framework import serializers

from apps.achievements.models import Achievement, PlayerAchievement


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "slug", "name", "description", "token_reward"]


class PlayerAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = PlayerAchievement
        fields = ["id", "achievement", "awarded_by", "awarded_at", "notes"]
        read_only_fields = ["id", "awarded_by", "awarded_at"]


class AwardAchievementSerializer(serializers.Serializer):
    profile_id = serializers.IntegerField()
    achievement_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)

    def save(self, **kwargs):
        from apps.players.models import PlayerProfile

        profile = PlayerProfile.objects.get(id=self.validated_data["profile_id"])
        achievement = Achievement.objects.get(id=self.validated_data["achievement_id"])
        player_achievement, _ = PlayerAchievement.objects.get_or_create(
            profile=profile,
            achievement=achievement,
            defaults={
                "awarded_by": self.context["request"].user,
                "notes": self.validated_data.get("notes", ""),
            },
        )
        return player_achievement
