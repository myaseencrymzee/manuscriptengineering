from rest_framework import serializers
from .models import Subscriber

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ["id", "user", "name", "email", "topic"]
        extra_kwargs = {"user": {"read_only": True}}


class SubscriberShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ["id", "name", "email", "topic"]
