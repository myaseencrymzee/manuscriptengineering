# serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    # emails = serializers.JSONField(write_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'attachment', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']
