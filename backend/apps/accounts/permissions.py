from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    allowed_roles: set[str] = set()

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in self.allowed_roles
        )


class IsCoach(RolePermission):
    allowed_roles = {"coach", "coordinator", "admin"}


class IsCoordinator(RolePermission):
    allowed_roles = {"coordinator", "admin"}


class IsPlayer(RolePermission):
    allowed_roles = {"player"}

