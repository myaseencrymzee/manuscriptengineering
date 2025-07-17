from django.contrib.auth import models
from api.core.choices import *



class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Service(BaseModel):
    title = models.CharField(max_length=CharFieldSizes.LARGE)
    description = models.TextField()
    image = models.ImageField(upload_to='service_images/')

    class Meta:
        abstract = True
