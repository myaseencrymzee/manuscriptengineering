from django.db import models
from api.core.abstract import BaseModel
from api.core.choices import CharFieldSizes, NOTIFICAITON_STATUS_CHOICES
# Create your models here.



class Notification(BaseModel):

    title = models.CharField(max_length=CharFieldSizes.LARGE)
    body = models.TextField()
    attachment = models.FileField(upload_to="email_attachments/", null=True, blank=True)
    status = models.CharField(max_length=10, choices=NOTIFICAITON_STATUS_CHOICES.choices, default=NOTIFICAITON_STATUS_CHOICES.PENDING)

    def __str__(self):
        return f"{self.title} - {self.status}"