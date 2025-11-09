from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCoach
from apps.players.models import PlayerProfile
from apps.tokens.models import TokenTransaction
from apps.tokens.serializers import TokenTransactionSerializer


class TokenTransactionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = TokenTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_profile_scope(self) -> PlayerProfile:
        user = self.request.user
        if user.role in {"coach", "coordinator", "admin"}:
            profile_id = self.request.query_params.get("profile")
            if profile_id:
                return PlayerProfile.objects.get(id=profile_id)
        return user.playerprofile

    def list(self, request):
        profile = self.get_profile_scope()
        queryset = profile.token_transactions.all()
        serializer = self.get_serializer(queryset, many=True)
        balance = TokenTransaction.balance_for_profile(profile)
        return Response({"balance": balance, "transactions": serializer.data})

    def get_permissions(self):
        if getattr(self, "action", None) == "create":
            return [IsCoach()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        profile_id = request.data.get("profile")
        if not profile_id:
            return Response({"detail": "profile is required."}, status=status.HTTP_400_BAD_REQUEST)
        profile = PlayerProfile.objects.get(id=profile_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = TokenTransaction.objects.create(
            profile=profile,
            amount=serializer.validated_data["amount"],
            reason=serializer.validated_data["reason"],
            created_by=request.user,
        )
        return Response(self.get_serializer(transaction).data, status=status.HTTP_201_CREATED)
