import requests
from django.conf import settings
from requests.auth import HTTPBasicAuth
import logging
from django.core.files.storage import default_storage
import mimetypes
import os
from typing import Optional, Dict, List, Union

logger = logging.getLogger(__name__)

class WordPressIntegration:
    def __init__(self):
        self.base_url = settings.WORDPRESS_SITE_URL
        self.api_url = f"{self.base_url}/wp-json/wp/v2"
        self.subscribers_api_url = f"{self.base_url}/wp-json/elementor-subscriptions/v1"
        self.auth = HTTPBasicAuth(settings.WORDPRESS_USERNAME, settings.WORDPRESS_APPLICATION_PASSWORD)
        self.timeout = 30

    # ======================
    #  Subscriber Methods
    # ======================

    def get_subscribers(self, page: int = 1, per_page: int = 100) -> Optional[Dict]:
        """
        Get paginated email subscribers from Elementor forms
        Returns: {
            'total': int,
            'page': int,
            'per_page': int,
            'total_pages': int,
            'subscribers': List[Dict]
        } or None if failed
        """
        try:
            response = requests.get(
                f"{self.subscribers_api_url}/subscribers",
                auth=self.auth,
                params={
                    'page': page,
                    'per_page': per_page
                },
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            
            logger.error(f"Subscriber fetch failed: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to fetch subscribers: {str(e)}", exc_info=True)
        return None

    def get_all_subscribers(self, batch_size: int = 500) -> List[Dict]:
        """Get all subscribers with automatic pagination handling"""
        all_subscribers = []
        current_page = 1
        
        while True:
            data = self.get_subscribers(page=current_page, per_page=batch_size)
            if not data or not isinstance(data, dict) or not data.get('subscribers'):
                break
                
            all_subscribers.extend(data['subscribers'])
            
            # Stop if we've reached the last page
            if current_page >= data.get('total_pages', 1):
                break
                
            current_page += 1

        return all_subscribers

    def get_subscriber_emails(self) -> List[str]:
        """Get just the email addresses of all subscribers"""
        subscribers = self.get_all_subscribers()
        return [sub['email'] for sub in subscribers if sub.get('email')]