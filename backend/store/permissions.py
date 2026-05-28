# store/permissions.py
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with role='admin'."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'admin'
        )


class IsSale(BasePermission):
    """Allow access only to users with role='sale'."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'sale'
        )


class IsCustomer(BasePermission):
    """Allow access only to users with role='customer'."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'customer'
        )


class IsAdminOrSale(BasePermission):
    """Allow admin OR sale users (e.g. for managing orders/stock)."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('admin', 'sale')
        )