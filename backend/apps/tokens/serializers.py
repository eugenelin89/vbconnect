from __future__ import annotations

from rest_framework import serializers

from apps.tokens.models import TokenTransaction


class TokenTransactionSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = TokenTransaction
        fields = ["id", "profile", "amount", "reason", "created_by", "created_at"]
        read_only_fields = ["id", "profile", "created_by", "created_at"]
