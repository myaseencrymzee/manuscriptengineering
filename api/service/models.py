from django.db import models
from api.core.abstract import Service, BaseModel
# Create your models here.


class Course(Service):
    file = models.FileField(upload_to='course_files/')

class CourseVideo(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    video_file = models.FileField(upload_to='course_videos/')

class Coaching(Service):
    file = models.FileField(upload_to='coaching_files/')


class Consulting(Service):
    pass


class Speaking(Service):
    pass

class Manuscript(Service):
    pass