from django.db import models
from api.core.abstract import BaseModel
from api.core.choices import CharFieldSizes, Topic

from django.contrib.auth import get_user_model

User = get_user_model()

class Subscriber(BaseModel):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, blank=True
    )
    name = models.CharField(max_length=CharFieldSizes.SMALL, null=True, blank=True)
    email = models.EmailField(null=True, blank=True, unique=False)  # Keep email unique but allow NULL for users
    topic = models.CharField(choices=Topic.choices, max_length=CharFieldSizes.MEDIUM, null= True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "topic"], name="unique_user_topic"),  # Ensures users can’t subscribe twice to the same topic
            models.UniqueConstraint(fields=["email"], name="unique_email_for_anonymous", condition=models.Q(user__isnull=True))  # Ensures email is unique for anonymous users
        ]

    def __str__(self):
        return f"{self.email or self.user} - {self.topic}"

