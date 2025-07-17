from django.apps import AppConfig


class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.blog'

    def ready(self):
        import api.blog.signals  # noqa