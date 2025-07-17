from django.db import models
from api.user.models import BaseModel
from api.core.choices import CharFieldSizes
# Create your models here.

class FAQ(BaseModel):
    question = models.CharField(max_length=CharFieldSizes.LARGE)
    answer = models.TextField(help_text="write answer to the question.")