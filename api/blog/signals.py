from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import Blog, BlogImage
from .wordpress_integration import WordPressIntegration
import logging
from api.core.choices import Status
logger = logging.getLogger(__name__)

def only_in_prod(func):
    """Decorator to only execute the signal handler in production environment"""
    def wrapper(*args, **kwargs):
        if getattr(settings, 'ENV', None) == 'prod':
            return func(*args, **kwargs)
        return None
    return wrapper



@receiver(post_save, sender=Blog)
@only_in_prod
def handle_blog_sync(sender, instance, created, **kwargs):
    """Handle blog creation/updates with WordPress"""
    if kwargs.get('raw', False):  # Skip for fixture loading
        return
        
    wp = WordPressIntegration()
    
    try:
        # Initial creation with minimal data (just image)
        if created and instance.get_featured_image() and not (instance.title and instance.content):
            # Don't create WordPress post yet, wait for content
            return
            
        # Full creation or update
        if created:
            wp.create_post(instance)
        else:
            # Only sync if important fields changed or status changed to published
            important_fields = ['title', 'content', 'date', 'status', 'publish_to']
            if any(instance.tracker.has_changed(field) for field in important_fields):
                wp.update_post(instance)
                
    except Exception as e:
        logger.error(f"WordPress sync failed for blog {instance.id}: {str(e)}", exc_info=True)

@receiver(post_delete, sender=Blog)
@only_in_prod
def handle_blog_deletion(sender, instance, **kwargs):
    """Handle blog deletion from WordPress"""
    if instance.wordpress_id:
        wp = WordPressIntegration()
        try:
            wp.delete_post(instance.wordpress_id)
        except Exception as e:
            logger.error(f"Failed to delete WordPress post {instance.wordpress_id}: {str(e)}", exc_info=True)


@receiver(post_save, sender=BlogImage)
def handle_blog_image_upload(sender, instance, created, **kwargs):
    """Upload blog image to WordPress and associate it with blog if new.
    Also set as featured image if it's the first image or newly uploaded."""
    if kwargs.get('raw', False):  # Skip for fixtures
        return
    
    blog = instance.blog
    
    if created:
        # First delete any existing featured images from WordPress
        if getattr(settings, 'ENV', None) == 'prod':
            wp = WordPressIntegration()
            try:
                # Delete previous featured images from WordPress
                for old_image in blog.images.exclude(id=instance.id):
                    if old_image.wordpress_media_id:
                        wp.delete_media(old_image.wordpress_media_id)
                        old_image.delete()  # Delete the old image from our DB
                
                # Upload new image
                media_id = wp.upload_media(instance.image)
                if media_id:
                    instance.wordpress_media_id = media_id
                    instance.save(update_fields=['wordpress_media_id'])
                    logger.info(f"Uploaded blog image to WordPress: Media ID {media_id}")
                    
                    # If blog is published, update the WordPress post
                    if blog.status == "published" and blog.wordpress_id:
                        wp.update_post(blog)
            except Exception as e:
                logger.error(f"Failed to upload blog image to WordPress: {str(e)}", exc_info=True)
        
        # In all environments (dev/prod), set this as the only image
        # Delete other images for this blog (to maintain one featured image)
        # blog.images.exclude(id=instance.id).delete()

@receiver(post_delete, sender=BlogImage)
def handle_blog_image_delete(sender, instance, **kwargs):
    """
    Delete blog image from WordPress AND update blog's featured image if needed.
    """
    blog = instance.blog
    blog = Blog.objects.get(id=blog.id)

    # WordPress media delete
    if instance.wordpress_media_id and getattr(settings, 'ENV', None) == 'prod':
        wp = WordPressIntegration()
        try:
            wp.delete_media(instance.wordpress_media_id)
            logger.info(f"Deleted WordPress media ID {instance.wordpress_media_id}")
        except Exception as e:
            logger.error(f"Failed to delete WordPress image: {str(e)}", exc_info=True)

    # Check if deleted image was the featured one and update if needed
    if blog.get_featured_image() is None and blog.images.exists():
        blog.update_featured_image_on_delete()
