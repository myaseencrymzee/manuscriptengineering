from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect


class AdminLoginRequiredMixin(LoginRequiredMixin):
    login_url = "/admin-login/"

    def dispatch(self, request, *args, **kwargs):
        """Redirects to login page if user is not authenticated or not an admin"""
        if not request.user.is_authenticated:
            return self.handle_no_permission()  # Redirects to login page

        if getattr(request.user, 'role', None) != 'admin':  
            return redirect(self.get_login_url())  # Redirect non-admin users

        return super().dispatch(request, *args, **kwargs)
    

class UserLoginRequiredMixin(LoginRequiredMixin):
    login_url = "/user-signin/"

    def dispatch(self, request, *args, **kwargs):
        """Redirects to login page if user is not authenticated or not an admin"""
        if not request.user.is_authenticated:
            return self.handle_no_permission()  # Redirects to login page

        if getattr(request.user, 'role', None) != 'user':  
            return redirect(self.get_login_url())  # Redirect non-admin users

        return super().dispatch(request, *args, **kwargs)