from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from api.service.models import Coaching, Consulting, Course, Speaking
from api.subscribers.models import Subscriber
from web.mixins import UserLoginRequiredMixin
from django.conf import settings
# Create your views here.

class HomeTemplateView(TemplateView):
    template_name = 'user/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_nav'] = "home"
        context['RECAPTCHA_SITE_KEY'] = settings.RECAPTCHA_SITE_KEY
        
        # context['subscribed_topics'] = []
        # if self.request.user.is_authenticated:
        #     context['subscribed_topics'] = list(Subscriber.objects.filter(user=self.request.user).values_list("topic", flat=True))
        return context


class BookNowTemplateView(TemplateView):
    template_name = 'user/book-now.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['RECAPTCHA_SITE_KEY'] = settings.RECAPTCHA_SITE_KEY

        return context

class ContactusTemplateView(TemplateView):
    template_name = 'user/contact-us.html'  

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_nav'] = "contact_us"
        context['RECAPTCHA_SITE_KEY'] = settings.RECAPTCHA_SITE_KEY
        return context  


class ResourcesTemplateView(TemplateView):
    template_name = 'user/resources.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["coaching"] = Coaching.objects.last()
        context["consulting"] = Consulting.objects.last()
        context["course"] = Course.objects.last()
        context["speaking"] = Speaking.objects.last()
        context['active_nav'] = "resources"
        context['course_files'] = Course.objects.all()
        context['coaching_files'] = Coaching.objects.all()
        return context  

class ServicesTemplateView(TemplateView):
    template_name = 'user/services.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context  
    

class AllServicesTemplateView(TemplateView):
    template_name = 'user/all-services.html'  

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_nav'] = "services"
        return context 
    

class BlogsTemplateView(TemplateView):
    template_name = 'user/blogs.html'  

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_nav'] = "blogs"
        return context 
    

class OtherResourcesTemplateView(UserLoginRequiredMixin, TemplateView):
    template_name = 'user/other-resources.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["coaching"] = Coaching.objects.last()
        context["consulting"] = Consulting.objects.last()
        context["course"] = Course.objects.last()
        context["speaking"] = Speaking.objects.last()
        context['active_nav'] = "resources"
        context['course_files'] = Course.objects.all()
        context['coaching_files'] = Coaching.objects.all()
        return context 


class TermsTemplateView(TemplateView):
    template_name = 'user/importantPages/terms.html'


class PrivacyTemplateView(TemplateView):
    template_name = 'user/importantPages/privacy.html'


class UserVerifyTemplateView(TemplateView):
    template_name = 'auth/user-email-verification.html'


class UserVerifyOTPTemplateView(TemplateView):
    template_name = 'auth/user-verify-otp.html'


class UserSignupTemplateView(TemplateView):
    template_name = 'auth/user-signup.html'


class UserSigninTemplateView(TemplateView):
    template_name = 'auth/user-signin.html'


class UserForgotPasswordTemplateView(TemplateView):
    template_name = 'auth/user-forgot-password.html'

class UserResetPasswordTemplateView(TemplateView):
    template_name = 'auth/user-reset-password.html'


class UserResetConfirmationTemplateView(TemplateView):
    template_name = 'auth/user-reset-confirmation.html'

class UserProfileManagementTemplateView(UserLoginRequiredMixin, TemplateView):
    template_name = 'user/profile-management.html'
    

class CourseVideosTemplateView(TemplateView):
    template_name = 'user/course-videos.html'  

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['active_nav'] = "services"
        context['course'] = Course.objects.get(id=context['id'])
        return context 


class UnsubscribeTemplateView(TemplateView):
    template_name = 'user/unsubscribe-user.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        try:
            subscriber = Subscriber.objects.get( id=kwargs['subscriber_id'])
            if subscriber:
                subscriber_records = Subscriber.objects.filter(email=subscriber.email)
                if len(subscriber_records) == 1:
                    subscriber_records.delete()
                else:
                    subscriber.delete()
        except Exception as e:
            print(e)
        # return JsonResponse({"message": "Successfully unsubscribed"})
        return context