from django.db import models
from api.core.abstract import BaseModel
# Create your models here.


class HomePageVideo(BaseModel):
    title = models.CharField(max_length=100)
    video_file = models.FileField(upload_to='homepage_videos/')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Home Page Video"
        verbose_name_plural = "Home Page Videos"