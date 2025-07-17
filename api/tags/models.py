from django.db import models
from api.core.abstract import BaseModel
from api.core.choices import CharFieldSizes
# Create your models here.

class Tag(BaseModel):
    text = models.CharField(max_length=CharFieldSizes.SMALL)

