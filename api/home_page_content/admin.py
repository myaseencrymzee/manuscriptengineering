from django.contrib import admin

# Register your models here.
# admin.py
from django.conf import settings
from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import HomePageVideo

def validate_video_size(value):
    if value.size > settings.MAX_VIDEO_UPLOAD_SIZE:
        raise ValidationError(
            f'File size exceeds {settings.MAX_VIDEO_UPLOAD_SIZE/1024/1024}MB limit'
        )

class HomePageVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at')
    actions = ['activate_video']
    
    def save_model(self, request, obj, form, change):
        # Validate file size
        if 'video_file' in form.changed_data and obj.video_file:
            validate_video_size(obj.video_file)
        
        # Handle activation
        if obj.is_active:
            HomePageVideo.objects.exclude(pk=obj.pk).update(is_active=False)
        super().save_model(request, obj, form, change)
    
    def activate_video(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Please select exactly one video to activate", level='error')
            return
        video = queryset.first()
        HomePageVideo.objects.exclude(pk=video.pk).update(is_active=False)
        video.is_active = True
        video.save()
        self.message_user(request, f"'{video.title}' is now the active video")
    activate_video.short_description = "Activate selected video"

admin.site.register(HomePageVideo, HomePageVideoAdmin)