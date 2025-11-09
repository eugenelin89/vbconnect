from django.contrib import admin

from apps.training.models import TrainingLog


@admin.register(TrainingLog)
class TrainingLogAdmin(admin.ModelAdmin):
    list_display = ("profile", "activity_type", "date", "duration_minutes", "is_verified")
    list_filter = ("activity_type", "date")
    search_fields = ("profile__user__email",)

