from django.contrib import admin
from . models import Blog, BlogImage
# Register your models here.

# admin.site.register(Blog)
# admin.site.register(BlogImage)


from django.contrib import admin
from .models import Blog, BlogImage, BlogComments
from .wordpress_integration import WordPressIntegration

class BlogImageInline(admin.TabularInline):
    model = BlogImage
    extra = 1

@admin.action(description='Publish to WordPress')
def publish_to_wordpress(modeladmin, request, queryset):
    wp = WordPressIntegration()
    for blog in queryset:
        if not blog.wordpress_id:
            wp.create_post(blog)

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'wordpress_id', 'wordpress_url')
    actions = [publish_to_wordpress]
    inlines = [BlogImageInline]

@admin.register(BlogComments)
class BlogCommentsAdmin(admin.ModelAdmin):
    list_display = ('blog', 'user', 'wordpress_comment_id')
