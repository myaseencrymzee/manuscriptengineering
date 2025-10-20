from django.urls import path
from rest_framework.routers import DefaultRouter

from api.payment.views import CaptureOrderAPIView, CreateOrderAPIView, CreateStripeSessionAPIView, GetStripeTokenAPIView, PayPalWebhookAPIView, StripeSuccessAPIView, StripeWebhookAPIView, StripeWebhookAPIView, download_pdf
from api.subscribers.views import SubscribeUserView, SubscriberListView
from api.bounced_emails.views import MailgunWebhookView
from .user.views import *
from api.service.views import *
from api.faq.views import FAQViewSet
from api.blog.views import *
from api.tags.views import *
from api.notification.views import *
from api.subsriber_popup.views import *
from api.home_page_content.views import *
from api.calendy.views import AppointmentViewSet, calendly_webhook


router = DefaultRouter(trailing_slash=False)
router.register(r"otp", OTPViewSet, basename="otp")
router.register(r"password", PasswordViewSet, basename="password")
router.register(r"course/video", CourseVideosViewSet, basename="course-video")
router.register(r"course", CourseViewSet, basename="course")
router.register(r"coaching", CoachingViewSet, basename="coaching")
router.register(r"consulting", ConsultingViewSet, basename="consulting")
router.register(r"speaking", SpeakingViewSet, basename="speaking")
router.register(r"manuscript", ManuscriptViewSet, basename="manuscript")
router.register(r"faqs", FAQViewSet, basename="faqs")
router.register(r"blog/image", BlogImageViewSet, basename="blog-image")
router.register(r"blog", BlogViewSet, basename="blog")
router.register(r"tag", TagViewSet, basename="tag")
router.register(r'blogs/(?P<blog_id>\d+)/comments', BlogCommentsViewSet, basename='blogcomments')
router.register(r'bookings', AppointmentViewSet, basename='appointment')
router.register(r"subscriber/popup", SubscriptionPopupViewSet, basename="subscriber-popup")
router.register(r'homepage/videos', HomePageVideoViewSet, basename='homepagevideo')


urlpatterns = [
    path("administration/login/", AdminLoginAPIView.as_view(), name="admin-login"),
    path("login/", UserLoginAPIView.as_view(), name="user-login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path('profile/', ProfileUpdateAPIView.as_view(), name="profile-update"),
    path('user/profile/', UserProfileUpdateAPIView.as_view(), name="user-profile-update"),
    path('contact/', ContactFormView.as_view(), name='contact-form'),
    path("book-session/", BookingView.as_view(), name="book-session"),
    path('subscribe/', SubscribeUserView.as_view(), name='subscribe_user'),
    path('subscribe/<int:id>/', SubscribeUserView.as_view(), name='unsubscribe_user'),
    path('subscribers-list/', SubscriberListView.as_view(), name='subscribers-list'),
    path('signup/', SignupView.as_view(), name='signup'),

    path('notification/send/', SendNotificationAPIView.as_view(), name='send-notification'),
    path('notifications/', NotificationListAPIView.as_view(), name='notification-list'),
    path('wordpress/users/', get_wordpress_users_data, name="wordpress-users" ),

    path('webhooks/calendly/', calendly_webhook, name='calendly_webhook'),
    path("bounced-emails/webhook/", MailgunWebhookView.as_view(), name="mailgun-webhook"),

    path("create-order/", CreateOrderAPIView.as_view(), name="create-order"),
    path("capture-order/", CaptureOrderAPIView.as_view(), name="capture-order"),
    path("download/<str:token>/", download_pdf, name="download-pdf"),
    # path("download/", download_pdf, name="download-pdf"),
    path("paypal/webhook/", PayPalWebhookAPIView.as_view(), name="paypal-webhook"),

    path("create-stripe-session/", CreateStripeSessionAPIView.as_view(), name="create-stripe-session"),
    path("stripe/webhook/", StripeWebhookAPIView.as_view(), name="stripe-webhook"),
    path("stripe/success/", StripeSuccessAPIView.as_view(), name="stripe-success"),
    path("get-stripe-token/", GetStripeTokenAPIView.as_view(), name="get-stripe-token"),

] + router.urls

