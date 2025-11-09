from rest_framework.routers import DefaultRouter

from apps.tokens.views import TokenTransactionViewSet


def register_routes(router: DefaultRouter) -> None:
    router.register("tokens", TokenTransactionViewSet, basename="tokens")

