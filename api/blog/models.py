from django.db import models
from api.core.abstract import BaseModel
from api.core.choices import CharFieldSizes, Status, TargetSites
from django.contrib.auth import get_user_model
from django.db import models
from model_utils import FieldTracker
User = get_user_model()

class Blog(BaseModel):
    title = models.CharField(max_length=CharFieldSizes.LARGE, null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    status = models.TextField(choices=Status.choices, default=Status.PENDING)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="blog_author")
    wordpress_id = models.IntegerField(null=True, blank=True)
    wordpress_url = models.URLField(null=True, blank=True)
    tracker = FieldTracker(fields=['title', 'content', 'date', 'status', 'publish_to'])
    publish_to = models.CharField(
        max_length=20,
        choices=TargetSites.choices,
        default=TargetSites.CONSTRUCTION,
        help_text="Select the sites to publish this blog to."
    )
    
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return self.title or f"Blog #{self.id}"
    
    def get_featured_image(self):
        """Get the first image as featured image"""
        return self.images.first().image if self.images.exists() else None
      
    def publish(self):
        """Publish the blog"""
        self.status = Status.PUBLISHED
        self.save()
        # The post_save signal will handle WordPress update
    

    def update_featured_image_on_delete(self):
        """
        Called when an image is deleted. Automatically updates the WordPress post
        with a new featured image (if available).
        """
        if self.status == Status.PUBLISHED and self.wordpress_id:
            from .wordpress_integration import WordPressIntegration
            wp = WordPressIntegration()
            wp.update_post(self)  # this will pick the new featured image


class BlogImage(BaseModel):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="blog_images/")
    wordpress_media_id = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return f"Image for {self.blog.title or f'Blog #{self.blog.id}'}"


class BlogComments(BaseModel):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    wordpress_comment_id = models.IntegerField(null=True, blank=True)