from rest_framework.routers import DefaultRouter


def register_routes(router: DefaultRouter) -> None:
    """Accounts exposes only auth endpoints handled separately."""
    return None

