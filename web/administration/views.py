from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from web.mixins import AdminLoginRequiredMixin


class AdminLoginTemplateView(TemplateView):
    template_name = 'auth/admin-login.html'

class AdminForgotPasswordTemplateView(TemplateView):
    template_name = 'auth/admin-forgot-password.html'

class AdminVerifyOTPTemplateView(TemplateView):
    template_name = 'auth/admin-verify-otp.html'


class AdminResetPasswordTemplateView(TemplateView):
    template_name = 'auth/admin-reset-password.html'

class AdminResetConfirmTemplateView(TemplateView):
    template_name = 'auth/admin-reset-confirmation.html'

class AdminManuscriptTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/manuscript.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "manuscript"
        return context



class AdminCoursesTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/courses.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "courses"
        return context

class AdminCoachingTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/coaching.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "coaching"
        return context

class AdminConsultingTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/consulting.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "consulting"
        return context

class AdminSpeakingTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/speaking.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "speaking"
        return context
    

class AdminTagsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/tag.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "tag"
        return context
    
class AdminFAQsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/faqs.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "faqs"
        return context
    
class AdminBlogsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/blogs.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "blogs"
        return context
    
class AdminAddBlogsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/add-blogs.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "blogs"
        return context
    
class AdminUpdateBlogsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/add-blogs.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "blogs"
        context['update_blog'] = True
        return context
    

class AdminViewBlogsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/add-blogs.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "blogs"
        context['view_blog'] = True
        return context
    
class AdminViewBookingsTemplateView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/bookings.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "bookings"
        context['view_blog'] = True
        return context
    
class AdminSubscribedUsersView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/subscribers.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "subscribers"
        # context['view_blog'] = True
        return context

class AdminNotificationsView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/notifications.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "notifications"
        # context['view_blog'] = True
        return context
    
class AdminNotificationPopupView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/notification-popup.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "notification_popup"
        # context['view_blog'] = True
        return context

class AdminHomePageContentView(AdminLoginRequiredMixin, TemplateView):
    template_name = 'administration/home-page-content.html'
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_sidebar'] = "homepage_content"
        # context['view_blog'] = True
        return context