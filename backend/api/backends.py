from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class EmailAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        
        # The frontend might pass the email inside the 'username' variable, 
        # or it might pass it explicitly as 'email'
        login_id = username or kwargs.get('email')
        
        if not login_id:
            return None
            
        try:
            # Tell Django to look for a match in EITHER the email column OR the username column
            user = UserModel.objects.get(Q(email__iexact=login_id) | Q(username__iexact=login_id))
        except UserModel.DoesNotExist:
            return None
            
        # If the user exists, check the password!
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
            
        return None