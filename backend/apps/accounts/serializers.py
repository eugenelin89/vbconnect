from __future__ import annotations

from django.contrib.auth import authenticate
from rest_framework import serializers

from apps.accounts.models import User
from apps.accounts.services import CreateUserPayload, create_user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "bio",
            "is_role_verified",
        ]
        read_only_fields = ["id", "is_role_verified"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.ChoiceField(choices=User.Roles.choices)
    bio = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        payload = CreateUserPayload(**validated_data)
        try:
            return create_user(payload)
        except ValueError as exc:
            raise serializers.ValidationError({"detail": str(exc)}) from exc

    def to_representation(self, instance):
        return UserSerializer(instance).data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        try:
            username = User.objects.get(email=email).username
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Invalid credentials") from exc
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        attrs["user"] = user
        return attrs
