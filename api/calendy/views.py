# views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from rest_framework import viewsets

from api.core.choices import STATUS_CHOICES
from api.core.pagination import Pagination
from .models import Appointment
from .serializers import AppointmentSerializer
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import django_filters
from rest_framework.filters import SearchFilter


class AppointmentModelFilters(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=STATUS_CHOICES.choices)

    class Meta:
        model = Appointment
        fields = ['status']

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Appointment.objects.all().order_by('-created_at')
    serializer_class = AppointmentSerializer
    pagination_class = Pagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['invitee_name', 'invitee_email', 'status']  
    filterset_class = AppointmentModelFilters


@csrf_exempt
@require_POST
def calendly_webhook(request):
    try:
        data = json.loads(request.body)
        # print("Received webhook data:", data)  # For debugging
        
        event_type = data.get('event')
        payload = data.get('payload', {})
        print(event_type)
        print(payload)
        
        if event_type == 'invitee.created':
            scheduled_event = payload.get('scheduled_event', {})
            invitee = payload
            
            # Extract meeting notes from Q&A if available
            meeting_notes = None
            qna = payload.get('questions_and_answers', [])
            if qna and len(qna) > 0:
                meeting_notes = qna[0].get('answer')
            
            # Create the appointment
            Appointment.objects.create(
                calendly_id=scheduled_event.get('uri').split('/')[-1],  # Extract UUID from URI
                service_type=scheduled_event.get('name', '').lower(),
                invitee_name=invitee.get('name'),
                invitee_email=invitee.get('email'),
                start_time=scheduled_event.get('start_time'),
                end_time=scheduled_event.get('end_time'),
                status='scheduled',
                calendly_uri=invitee.get('uri'),
                cancel_url=invitee.get('cancel_url'),
                reschedule_url=invitee.get('reschedule_url'),
                meeting_notes=meeting_notes,
                timezone=invitee.get('timezone'),
                location=scheduled_event.get('location', {}).get('join_url'),
            )
            
        elif event_type == 'invitee.canceled':
            scheduled_event = payload.get('scheduled_event', {})
            Appointment.objects.filter(
                calendly_id=scheduled_event.get('uri').split('/')[-1]
            ).update(status='canceled')
            
        elif event_type == 'invitee.rescheduled':
            print(payload)
            scheduled_event = payload.get('scheduled_event', {})
            Appointment.objects.filter(
                calendly_id=scheduled_event.get('uri').split('/')[-1]
            ).update(
                start_time=scheduled_event.get('start_time'),
                end_time=scheduled_event.get('end_time'),
                status='rescheduled'
            )
            
        return JsonResponse({'status': 'success'})
        
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")  # Log the error
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=400
        )