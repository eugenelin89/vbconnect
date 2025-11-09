from django.apps import AppConfig


class TokensConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.tokens"

    def ready(self):
        from apps.tokens import signals  # noqa: F401

