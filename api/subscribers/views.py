from django.http import Http404
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Subscriber
from api.bounced_emails.models import BouncedEmail
from .serializers import SubscriberSerializer, SubscriberShortSerializer
from api.core.pagination import Pagination
from api.notification.wordpress_users_integration import WordPressIntegration 
from django.db.models import Q
from api.core.helpers import send_welcome_email


class SubscribeUserView(generics.CreateAPIView, generics.DestroyAPIView):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'  # This tells DRF to use 'id' in URL for deletion

    def create(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        email = request.data.get("email")
        topic = request.data.get("topic")

        # Prevent duplicate topic subscriptions for authenticated users
        if user:
            if Subscriber.objects.filter(user=user, topic=topic).exists():
                return Response({"message": "You are already subscribed to this topic."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent anonymous users from subscribing twice with the same email
        elif Subscriber.objects.filter(email=email).exists():
            return Response({"message": "This email is already subscribed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            subscriber = serializer.save(user=user if user else None)  # Assign user if authenticated
            send_welcome_email(subscriber)
            return Response({"message": "Subscription successful!"}, status=status.HTTP_201_CREATED)

        return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()            
            instance.delete()
            return Response({"message": "Unsubscribed successfully."},status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response({"message": "Subscription not found."},
                          status=status.HTTP_404_NOT_FOUND)


class SubscriberListView(generics.ListAPIView):
    serializer_class = SubscriberShortSerializer
    permission_classes = [IsAdminUser]
    pagination_class = Pagination

    def list(self, request, *args, **kwargs):
        search_query = request.GET.get("search", "").lower()

        # 0. Get all bounced emails
        bounced_emails = set(BouncedEmail.objects.values_list("email", flat=True))

        # 1. Local subscribers (filtered if search applied and excluding bounced)
        local_qs = Subscriber.objects.exclude(email__in=bounced_emails)
        if search_query:
            local_qs = local_qs.filter(
                Q(name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(topic__icontains=search_query)
            )
        local_serialized = SubscriberShortSerializer(local_qs, many=True).data
        for item in local_serialized:
            item['source'] = 'local'

        # 2. WordPress subscribers (manual filtering and excluding bounced)
        wp = WordPressIntegration()
        wp_response = wp.get_all_subscribers() or []
        # wp_response = []

        wp_serialized = []
        if isinstance(wp_response, list):
            for sub in wp_response:
                name = sub.get("fields", {}).get("name", "")
                email = sub.get("fields", {}).get("email", sub.get("email", ""))

                if email in bounced_emails:
                    continue  # skip bounced email

                if search_query and not (
                    search_query in name.lower() or
                    search_query in email.lower()
                ):
                    continue  # skip if not matching search

                wp_serialized.append({
                    "name": name,
                    "email": email,
                    "topic": None,
                    "source": "wordpress",
                })

        # 3. Combine and paginate
        combined_data = local_serialized + wp_serialized

        page = self.paginate_queryset(combined_data)
        if page is not None:
            return self.get_paginated_response(page)

        return Response(combined_data)