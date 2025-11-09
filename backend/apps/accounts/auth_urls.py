from django.urls import path

from apps.accounts.views import CurrentUserAPIView, LoginAPIView, RegisterAPIView

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="auth-register"),
    path("login/", LoginAPIView.as_view(), name="auth-login"),
    path("me/", CurrentUserAPIView.as_view(), name="auth-me"),
]

