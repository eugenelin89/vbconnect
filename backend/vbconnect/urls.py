from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.accounts.routers import register_routes as register_account_routes
from apps.players.routers import register_routes as register_player_routes
from apps.players.views import OwnPlayerProfileAPIView
from apps.teams.routers import register_routes as register_team_routes
from apps.training.routers import register_routes as register_training_routes
from apps.training.views import VerificationAPIView
from apps.achievements.routers import register_routes as register_achievement_routes
from apps.tokens.routers import register_routes as register_token_routes

router = DefaultRouter()
register_account_routes(router)
register_player_routes(router)
register_team_routes(router)
register_training_routes(router)
register_achievement_routes(router)
register_token_routes(router)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/profile/", OwnPlayerProfileAPIView.as_view(), name="player-profile"),
    path("api/verify/", VerificationAPIView.as_view(), name="verify"),
    path("api/auth/", include("apps.accounts.auth_urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="api-docs",
    ),
]
