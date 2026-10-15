"""
Custom authentication backends for SAHAYAK platform.
Allows login with email, phone, or username.
"""
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from authentication.models import SahayakUser


class EmailPhoneUsernameAuthBackend(ModelBackend):
    """
    Custom authentication backend that allows users to login with:
    - Email address
    - Phone number
    - Username
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user using email, phone, or username.
        """
        if username is None or password is None:
            return None
        
        try:
            # Try to find user by email, phone, or username
            user = SahayakUser.objects.get(
                Q(email=username) | Q(phone_number=username) | Q(username=username)
            )
            
            # Check password
            if user.check_password(password):
                return user
            
        except SahayakUser.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            SahayakUser().set_password(password)
            return None
        except SahayakUser.MultipleObjectsReturned:
            # If multiple users found, try exact match by username first
            try:
                user = SahayakUser.objects.get(username=username)
                if user.check_password(password):
                    return user
            except SahayakUser.DoesNotExist:
                pass
            return None
        
        return None
    
    def get_user(self, user_id):
        """
        Get user by ID.
        """
        try:
            return SahayakUser.objects.get(pk=user_id)
        except SahayakUser.DoesNotExist:
            return None
