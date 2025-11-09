from django.contrib import admin

from apps.teams.models import Division, Team, TeamMembership


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ("name", "league_type")
    search_fields = ("name",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "division", "season_year", "created_by")
    list_filter = ("division", "season_year")
    search_fields = ("name",)


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ("team", "user", "role", "is_approved")
    list_filter = ("role", "is_approved")
    search_fields = ("team__name", "user__email")

