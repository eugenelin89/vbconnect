from rest_framework.routers import DefaultRouter

from apps.training.views import TrainingLogViewSet


def register_routes(router: DefaultRouter) -> None:
    router.register("training", TrainingLogViewSet, basename="training")

