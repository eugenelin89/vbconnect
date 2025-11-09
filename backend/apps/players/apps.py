from django.apps import AppConfig


class PlayersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.players"

    def ready(self):
        from apps.players import signals  # noqa: F401

