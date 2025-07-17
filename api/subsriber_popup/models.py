from django.db import models
from api.core.abstract import BaseModel


# Create your models here.
class SubscriptionPopup(BaseModel):
    title = models.CharField(max_length=255)
    message = models.TextField()
    lead_magnet_image = models.ImageField(upload_to='popup_images/')
    lead_magnet_pdf = models.FileField(upload_to='lead_magnets/')

    def __str__(self):
        return "Subscription Popup Content"
