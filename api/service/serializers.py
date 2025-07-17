from rest_framework import serializers
from api.core.helpers import send_services_email
from api.core.validators import validate_video_size
from django.core.validators import FileExtensionValidator
from api.subscribers.models import Subscriber
from . models import *
from api.core.choices import Topic
from django.db.models import Q


class CourseVideoSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField(validators=[
        FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'ogg', 'jpg']),
        validate_video_size
    ])
    class Meta:
        model = CourseVideo
        fields = ['course', 'video_file']


class ReturnCourseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVideo
        fields = ['id', 'video_file']

class CourseSerializer(serializers.ModelSerializer):
    videos = ReturnCourseVideoSerializer(many=True, read_only=True)  # Explicitly many=True for the list

    class Meta:
        model = Course
        fields = ['id', 'title', 'image', 'description', 'file', 'videos']

    def create(self, validated_data):
        request = self.context['request']
        course = super().create(validated_data)
        
        # Get subscribers interested in this topic
        subscribers = Subscriber.objects.filter(Q(topic=Topic.COURSES) | Q(topic=Topic.ALL))
        recipient_list = [subscriber.email for subscriber in subscribers]
        recipient_list_ids = [subscriber.id for subscriber in subscribers]

        if recipient_list:
            send_services_email(recipient_list, course, recipient_list_ids, request)

        return course


class CoachingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Coaching
        fields = ['id', 'title', 'image', 'description', 'file']
    
    def create(self, validated_data):
        request = self.context['request']
        # Create the course instance
        coaching = super().create(validated_data)
        # Get subscribers interested in this topic
        subscribers = Subscriber.objects.filter(Q(topic=Topic.COACHING) | Q(topic=Topic.ALL))
        recipient_list = [subscriber.email for subscriber in subscribers]
        recipient_list_ids = [subscriber.id for subscriber in subscribers]

        # Send emails if subscribers exist
        if recipient_list:
            send_services_email(recipient_list, coaching, recipient_list_ids, request)

        return coaching


class ConsultingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Consulting
        fields = ['id', 'title', 'image', 'description']
    
    def create(self, validated_data):
        request = self.context['request']
        # Create the course instance
        consulting = super().create(validated_data)
        # Get subscribers interested in this topic
        subscribers = Subscriber.objects.filter(Q(topic=Topic.CONSULTING) | Q(topic=Topic.ALL))
        recipient_list = [subscriber.email for subscriber in subscribers]
        recipient_list_ids = [subscriber.id for subscriber in subscribers]

        # Send emails if subscribers exist
        if recipient_list:
            send_services_email(recipient_list, consulting, recipient_list_ids, request)

        return consulting


class SpeakingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Speaking
        fields = ['id', 'title', 'image', 'description']

    def create(self, validated_data):
        request = self.context['request']
        # Create the course instance
        speaking = super().create(validated_data)
        # Get subscribers interested in this topic
        subscribers = Subscriber.objects.filter(Q(topic=Topic.SPEAKING) | Q(topic=Topic.ALL))
        recipient_list = [subscriber.email for subscriber in subscribers]
        recipient_list_ids = [subscriber.id for subscriber in subscribers]

        # Send emails if subscribers exist
        if recipient_list:
            send_services_email(recipient_list, speaking, recipient_list_ids, request)

        return speaking
    

class ManuscriptSerializer(serializers.ModelSerializer):

    class Meta:
        model = Manuscript
        fields = ['id', 'title', 'image', 'description']

    