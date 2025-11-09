from rest_framework.routers import DefaultRouter

from apps.players.views import PerformanceMetricViewSet, PlayerProfileViewSet


def register_routes(router: DefaultRouter) -> None:
    router.register("players", PlayerProfileViewSet, basename="players")
    router.register("metrics", PerformanceMetricViewSet, basename="metrics")

