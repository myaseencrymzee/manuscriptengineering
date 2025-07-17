import requests
from django.conf import settings
from requests.auth import HTTPBasicAuth
import logging
from django.core.files.storage import default_storage
import mimetypes
import os

logger = logging.getLogger(__name__)

class WordPressIntegration:

    def __init__(self):
        self.base_url = settings.WORDPRESS_SITE_URL
        self.api_url = f"{self.base_url}/wp-json/wp/v2"
        self.auth = HTTPBasicAuth(settings.WORDPRESS_USERNAME, settings.WORDPRESS_APPLICATION_PASSWORD)
        self.timeout = 30  # Increased timeout for media uploads
    
    def _get_media_headers(self, file_path):
        """Get proper headers for media upload"""
        file_name = os.path.basename(file_path)
        mime_type, _ = mimetypes.guess_type(file_name)
        return {
            'Content-Disposition': f'attachment; filename={file_name}',
            'Content-Type': mime_type or 'application/octet-stream'
        }
    
    def upload_media(self, image_field):
        """Upload an image to WordPress and return media ID"""
        if not image_field:
            return None
        
        try:
            image_path = image_field.path
            file_name = os.path.basename(image_path)
            
            with default_storage.open(image_path, 'rb') as image_file:
                headers = self._get_media_headers(image_path)
                files = {'file': (file_name, image_file, headers['Content-Type'])}
                
                response = requests.post(
                    f"{self.api_url}/media",
                    files=files,
                    auth=self.auth,
                    headers={'Content-Disposition': headers['Content-Disposition']},
                    timeout=self.timeout
                )
                
                if response.status_code == 201:
                    data = response.json()
                    return data['id']
                else:
                    logger.error(f"Media upload failed: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to upload media: {str(e)}", exc_info=True)
        return None

    def delete_media(self, media_id):
        """Delete media from WordPress"""
        try:
            response = requests.delete(
                f"{self.api_url}/media/{media_id}",
                params={'force': True},
                auth=self.auth,
                timeout=self.timeout
            )
            if response.status_code == 200:
                logger.info(f"Deleted media {media_id} from WordPress")
                return True
            else:
                logger.error(f"Failed to delete media {media_id}: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Exception while deleting media {media_id}: {str(e)}", exc_info=True)
        return False

    def create_post(self, blog):
        """Create new WordPress post"""
        featured_image_id = None
        if blog.get_featured_image():
            featured_image_id = self.upload_media(blog.get_featured_image())
            
        post_data = {
            'title': blog.title,
            'content': blog.content,
            'status': 'publish' if (blog.status == 'published' and blog.publish_to in ['alin', 'both']) else 'draft',
            'date': blog.date.isoformat() if blog.date else None,
            'featured_media': featured_image_id,
        }
        print("------------",post_data)
        try:
            response = requests.post(
                f"{self.api_url}/posts",
                json=post_data,
                auth=self.auth,
                timeout=self.timeout
            )
            
            if response.status_code == 201:
                data = response.json()
                blog.wordpress_id = data['id']
                blog.wordpress_url = data['link']
                blog.save(update_fields=['wordpress_id', 'wordpress_url'])
                return data
            else:
                logger.error(f"Post creation failed: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to create WordPress post: {str(e)}", exc_info=True)
        return None
    
    def update_post(self, blog):
        """Update existing WordPress post"""
        if not blog.wordpress_id:
            logger.warning(f"No WordPress ID for blog {blog.id}, creating new post")
            return self.create_post(blog)

        featured_image = blog.get_featured_image()
        featured_image_id = None
        
        if featured_image:
            # If we already have a media ID, use it
            blog_image = blog.images.first()
            if blog_image and blog_image.wordpress_media_id:
                featured_image_id = blog_image.wordpress_media_id
            else:
                # Otherwise upload new image
                featured_image_id = self.upload_media(featured_image)
                if blog_image and featured_image_id:
                    blog_image.wordpress_media_id = featured_image_id
                    blog_image.save(update_fields=['wordpress_media_id'])

        # Get the current time in WordPress expected format
        from django.utils.timezone import now
        current_time = now().isoformat()
        
        # If the blog has a modification date, use that instead
        if hasattr(blog, 'updated_at') and blog.updated_at:
            current_time = blog.updated_at.isoformat()
        elif hasattr(blog, 'modified_date') and blog.modified_date:
            current_time = blog.modified_date.isoformat()

        post_data = {
            'title': blog.title,
            'content': blog.content,
             'status': 'publish' if (blog.status == 'published' and blog.publish_to in ['alin', 'both']) else 'draft',
            'date': current_time,  # This sets the publication date
            'modified': current_time,  # This sets the modification date
        }
        print("up=-------------------", post_data)

        # Explicitly set featured media (even if None to remove existing)
        post_data['featured_media'] = featured_image_id

        try:
            response = requests.post(
                f"{self.api_url}/posts/{blog.wordpress_id}",
                json=post_data,
                auth=self.auth,
                timeout=self.timeout
            )

            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Post update failed: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to update WordPress post: {str(e)}", exc_info=True)
        return None

    def delete_post(self, wp_post_id):
        """Delete WordPress post"""
        try:
            response = requests.delete(
                f"{self.api_url}/posts/{wp_post_id}",
                params={'force': True},
                auth=self.auth,
                timeout=self.timeout
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to delete WordPress post: {str(e)}", exc_info=True)
            return False