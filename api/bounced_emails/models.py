from django.db import models
from api.core.abstract import BaseModel


class BouncedEmail(BaseModel):
    email = models.EmailField(unique=True)
    reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.email