from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.notification.wordpress_users_integration import WordPressIntegration
from api.subscribers.models import Subscriber
from .serializers import NotificationSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from rest_framework.generics import ListAPIView
from .models import Notification
from api.bounced_emails.models import BouncedEmail
from api.core.tasks import send_notification_email
from api.core.pagination import Pagination
from api.core.choices import NOTIFICAITON_STATUS_CHOICES
from threading import Thread

# Create your views here.

class SendNotificationAPIView(APIView):
    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():

            local_emails = list(Subscriber.objects.values_list('email', flat=True).distinct())
            wp = WordPressIntegration()
            wordpress_emails = wp.get_subscriber_emails() or []
            # wordpress_emails = []

            bounced = set(BouncedEmail.objects.values_list('email', flat=True))
            combined_emails = list(set(local_emails + wordpress_emails) - bounced)

            notification = Notification.objects.create(**serializer.validated_data)

            print("local emails", len(local_emails))
            print("WP emails", len(wordpress_emails))

            print("emails count", combined_emails.count)
            
            thread = Thread(target=send_notification_email, args=(notification.id, combined_emails, request))
            thread.start()

            return Response({'message': 'Notification sent.','total_recipients': len(combined_emails)},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationModelFilters(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=NOTIFICAITON_STATUS_CHOICES.choices)

    class Meta:
        model = Notification
        fields = ['status']


class NotificationListAPIView(ListAPIView):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['title', 'body', 'status']  
    filterset_class = NotificationModelFilters


def get_wordpress_users_data(request):
    from . wordpress_users_integration import WordPressIntegration
    wp = WordPressIntegration()
    subscribers = wp.get_subscriber_emails()
    
    if subscribers is None:
        return JsonResponse({'success': False,'error': 'Failed to fetch subscribers from WordPress'}, status=500)
    
    return JsonResponse({'success': True,'count': len(subscribers),'subscribers': subscribers}, status=200)