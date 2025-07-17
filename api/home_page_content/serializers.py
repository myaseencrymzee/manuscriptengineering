# serializers.py
from rest_framework import serializers
from django.conf import settings
from django.core.validators import FileExtensionValidator
from .models import HomePageVideo
from api.core.validators import validate_video_size

class HomePageVideoSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField(
        validators=[validate_video_size, FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'ogg'])]
    )

    class Meta:
        model = HomePageVideo
        fields = ['id', 'title', 'video_file', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']