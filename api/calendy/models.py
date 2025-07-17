# models.py
from django.db import models
from api.core.choices import SERVICE_CHOICES, STATUS_CHOICES
from api.core.abstract import BaseModel

class Appointment(BaseModel):

    calendly_id = models.CharField(max_length=100, unique=True)
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES.choices)
    invitee_name = models.CharField(max_length=255)
    invitee_email = models.EmailField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES.choices, default=STATUS_CHOICES.SCHEDULED)
    calendly_uri = models.URLField()
    cancel_url = models.URLField(blank=True, null=True)
    reschedule_url = models.URLField(blank=True, null=True)
    meeting_notes = models.TextField(blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.get_service_type_display()} with {self.invitee_name} at {self.start_time}"