"""
Custom permission classes for role-based access control.
"""
from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    """Allow access only to customers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'customer'
        )


class IsIndividualWorker(permissions.BasePermission):
    """Allow access only to individual workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'individual_worker'
        )


class IsOrganizationAdmin(permissions.BasePermission):
    """Allow access only to organization admins."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'organization_admin'
        )


class IsOrganizationWorker(permissions.BasePermission):
    """Allow access only to organization workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role == 'organization_worker'
        )


class IsAnyWorker(permissions.BasePermission):
    """Allow access to both individual workers and organization workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role in ['individual_worker', 'organization_worker']
        )


class IsOrganizationMember(permissions.BasePermission):
    """Allow access to organization admins and workers."""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.role in ['organization_admin', 'organization_worker']
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` or `user` attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
