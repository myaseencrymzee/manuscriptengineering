import requests
from django.conf import settings

class CMSMetaContextMixin:
    page_key = None 
    web_app = "me" 

    def _format_keywords(self, keywords):
        if isinstance(keywords, list):
            return ", ".join(map(str, keywords))
        return keywords or ""

    def get_meta_context(self):
        if not self.page_key:
            return self._empty_meta()

        try:
            response = requests.get(
                f"{settings.CONTENT_API_URL}api/meta-tags",
                params={
                    "web_app": self.web_app,
                    "page_slug": self.page_key,
                },
                timeout=3, 
            )
            
            if response.status_code != 200:
                return self._empty_meta()

            payload = response.json()
            if isinstance(payload, dict) and "data" in payload:
                payload = payload["data"]

            if not payload:
                return self._empty_meta()

            meta = payload[0]  
            return {
                "meta_title": meta.get("title"),
                "meta_description": meta.get("description"),
                "meta_keywords": self._format_keywords(meta.get("tags")),
            }
        except Exception as e:
            return self._empty_meta()

    def _empty_meta(self):
        return {
            "meta_title": None,
            "meta_description": None,
            "meta_keywords": None,
        }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context.update(self.get_meta_context())
        return context
