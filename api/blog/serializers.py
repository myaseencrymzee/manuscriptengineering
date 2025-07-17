from rest_framework import serializers
from .models import Blog, BlogComments, BlogImage
from django.db import transaction
from django.contrib.auth import get_user_model
from api.core.utitls import read_time
User = get_user_model()
from api.user.serializers import authorSerializer
from api.core.choices import Status, TargetSites
from rest_framework.exceptions import PermissionDenied, NotFound


class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'blog']


class BlogSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True, required=False) 
    images = BlogImageSerializer(many=True, read_only=True) 
    author = authorSerializer(read_only=True)
    read_time = serializers.SerializerMethodField()
    publish_to = serializers.ChoiceField(choices=TargetSites.choices, required=False)

    class Meta:
        model = Blog
        fields = ['id', 'title', 'date', 'content', 'author', 'status', 'image', 'images', 'read_time', 'publish_to']

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        image = validated_data.pop('image', None) 
        validated_data['author'] = request.user
        blog = Blog.objects.create(**validated_data)
        print(validated_data)
        if image:
            BlogImage.objects.create(blog=blog, image=image)
        return blog

    @transaction.atomic
    def update(self, instance, validated_data):
        image = validated_data.pop("image", None) 
        
        if "status" in validated_data and instance.status == Status.PUBLISHED:
            validated_data.pop("status") 
        
        blog = super().update(instance, validated_data)
        if image:
            BlogImage.objects.create(blog=blog, image=image)
        
        return blog
    
    def get_read_time(self, obj):
        return read_time(obj.content)
    

class BlogCommentsSerializer(serializers.ModelSerializer):
    blog = serializers.PrimaryKeyRelatedField(queryset=Blog.objects.all(), write_only=True, required=False)
    user = authorSerializer(read_only=True)

    class Meta:
        model = BlogComments
        fields = ['id', 'blog', 'user', 'comment', 'created_at']
        extra_kwargs = {'blog': {'required': False}, 'user': {'required': False}}  # Prevents "This field is required" error

    def create(self, validated_data):
        """Allow only authenticated users to create comments and assign blog from URL."""
        request = self.context['request']
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required to comment.")

        # Get blog_id from the URL
        blog_id = self.context['view'].kwargs.get('blog_id')
        if not blog_id:
            raise serializers.ValidationError({"blog": "Blog ID is missing from the URL."})

        # Attach blog and user to comment
        validated_data['blog'] = Blog.objects.get(id=blog_id)
        validated_data['user'] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Only allow the comment owner to update their comment"""
        request = self.context['request']
        if instance.user != request.user:
            raise PermissionDenied("You can only edit your own comment.")

        instance.comment = validated_data.get('comment', instance.comment)
        instance.save()
        return instance

    def delete(self, instance):
        """Only allow the comment owner to delete their comment"""
        request = self.context['request']
        if instance.user != request.user:
            raise PermissionDenied("You can only delete your own comment.")

        instance.delete()