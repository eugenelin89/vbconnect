from django.contrib import admin

from apps.achievements.models import Achievement, PlayerAchievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("name", "token_reward")
    search_fields = ("name", "slug")


@admin.register(PlayerAchievement)
class PlayerAchievementAdmin(admin.ModelAdmin):
    list_display = ("profile", "achievement", "awarded_at", "awarded_by")
    list_filter = ("achievement",)
    search_fields = ("profile__user__email",)

