# project/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'alin_marin_books.settings')

app = Celery('alin_marin_books')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
