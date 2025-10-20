from django.urls import path

from web.administration.views import *
from .views import *
from .user.views import *

urlpatterns = [  
    path('', HomeTemplateView.as_view(), name="home"),
    path('book-now/', BookNowTemplateView.as_view(), name="book-now"),
    path('contact-us/', ContactusTemplateView.as_view(), name="contact-us"),
    path('resources/<int:id>/', ResourcesTemplateView.as_view(), name="resources"),
    path('services/<str:type>/', ServicesTemplateView.as_view(), name="coaching"),
    path('all-services/', AllServicesTemplateView.as_view(), name="all-services"),
    path('blogs/', BlogsTemplateView.as_view(), name="blogs"),
    path('other-resources/', OtherResourcesTemplateView.as_view(), name="other-resources"),
    path('terms/', TermsTemplateView.as_view(), name="terms"),
    path('privacy-policy/', PrivacyTemplateView.as_view(), name="privacy-policy"),
    path('user-email-verify/', UserVerifyTemplateView.as_view(), name="user-email-verify"),
    path('user-verify-otp/', UserVerifyOTPTemplateView.as_view(), name="user-otp-verify"),
    path('user-signup/', UserSignupTemplateView.as_view(), name="user-signup"),
    path('user-signin/', UserSigninTemplateView.as_view(), name="user-signin"),
    path('user-forgot-password/', UserForgotPasswordTemplateView.as_view(), name="user-forgot-password"),
    path('user-reset-password/', UserResetPasswordTemplateView.as_view(), name="user-reset-password"),
    path('user-reset-confirmation/', UserResetConfirmationTemplateView.as_view(), name="user-reset-confirmation"),
    path('user-profile-management/', UserProfileManagementTemplateView.as_view(), name="user-profile-management"),
    path("unsubscribe/<int:subscriber_id>/", UnsubscribeTemplateView.as_view(), name="unsubscribe-user"),
    path("course/<int:id>/videos/", CourseVideosTemplateView.as_view(), name="course-videos"),
    path('payment-success/', SuccessTemplateView.as_view(), name="payment-success"),
    


    path('admin-login/', AdminLoginTemplateView.as_view(), name="admin-login"),
    path('admin-forgot-password/', AdminForgotPasswordTemplateView.as_view(), name="admin-forgot-password"),
    path('admin-verify-otp/', AdminVerifyOTPTemplateView.as_view(), name="admin-verify-otp"),
    path('admin-reset-password/', AdminResetPasswordTemplateView.as_view(), name="admin-reset-password"),
    path('admin-reset-confirmation/', AdminResetConfirmTemplateView.as_view(), name="admin-reset-confirmarmation"),
    path('admin-manuscript-engineering/', AdminManuscriptTemplateView.as_view(), name="admin-manuscript-engineering"),
    path('admin-courses/', AdminCoursesTemplateView.as_view(), name="admin-courses"),
    path('admin-coaching/', AdminCoachingTemplateView.as_view(), name="admin-coaching"),
    path('admin-consulting/', AdminConsultingTemplateView.as_view(), name="admin-consulting"),
    path('admin-speaking/', AdminSpeakingTemplateView.as_view(), name="admin-speaking"),
    path('admin-tags/', AdminTagsTemplateView.as_view(), name="admin-tags"),
    path('admin-faqs/', AdminFAQsTemplateView.as_view(), name="admin-faqs"),
    path('admin-blogs/', AdminBlogsTemplateView.as_view(), name="admin-blogs"),
    path('admin-add-blogs/', AdminAddBlogsTemplateView.as_view(), name="admin-add-blogs"),
    path('admin-update-blogs/<int:id>/', AdminUpdateBlogsTemplateView.as_view(), name="admin-update-blogs"),
    path('admin-view-blogs/<int:id>/', AdminViewBlogsTemplateView.as_view(), name="admin-view-blogs"),
    path('admin-view-bookings/', AdminViewBookingsTemplateView.as_view(), name="admin-view-bookings"),
    path('admin-view-subscribers/', AdminSubscribedUsersView.as_view(), name="admin-view-subscribers"),
    path('admin-view-notifications/', AdminNotificationsView.as_view(), name="admin-view-notifications"),
    path('admin-view-notification-popup/', AdminNotificationPopupView.as_view(), name="admin-view-notification-popup"),
    path("admin-home-page-content/", AdminHomePageContentView.as_view(), name="admin-home-page-content")
]