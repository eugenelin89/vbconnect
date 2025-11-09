from rest_framework.routers import DefaultRouter

from apps.teams.views import DivisionViewSet, TeamViewSet


def register_routes(router: DefaultRouter) -> None:
    router.register("divisions", DivisionViewSet, basename="divisions")
    router.register("teams", TeamViewSet, basename="teams")

