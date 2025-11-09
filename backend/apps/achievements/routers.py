from rest_framework.routers import DefaultRouter

from apps.achievements.views import PlayerAchievementViewSet


def register_routes(router: DefaultRouter) -> None:
    router.register("achievements", PlayerAchievementViewSet, basename="achievements")

