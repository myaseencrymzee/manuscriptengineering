from django.db import models


class Roles(models.TextChoices):
    ADMIN = "admin", "Admin"
    USER = "user", "User"


class OTPTypes(models.TextChoices):
    CREATE = "create", "Create"
    FORGOT = "forgot", "Forgot"
    UPDATE = "update", "Update"


class CharFieldSizes(models.IntegerChoices):
    SMALL = 50
    MEDIUM = 100
    LARGE = 255

class Status(models.TextChoices):
    PENDING = "pending", "Pending"
    PUBLISHED = "published", "Published"

class Topic(models.TextChoices):
    COURSES = "courses", "Courses"
    CONSULTING = "consulting", "Consulting"
    COACHING = "coaching", "Coaching"
    SPEAKING = "speaking", "Speaking"
    ALL = "all", "All"

class SERVICE_CHOICES(models.TextChoices):
    CONSULTING = "consulting", "Consulting"
    COACHING = "coaching", "Coaching"
    SPEAKING = "speaking", "Speaking"

class STATUS_CHOICES(models.TextChoices):
    SCHEDULED = 'scheduled', 'Scheduled'
    CANCELED = 'canceled', 'Canceled'
    RESCHEDULED = 'rescheduled', 'Rescheduled'
    COMPLETED = 'completed', 'Completed'


class NOTIFICAITON_STATUS_CHOICES(models.TextChoices):
    PENDING = 'pending', 'Pending'
    SENT = 'sent', 'Sent'
    FAILED = 'failed', 'Failed'


class TargetSites(models.TextChoices):
    CONSTRUCTION = 'construction', 'Construction Management Success'
    ALINE = 'alin', 'Aline Marin'
    BOTH = 'both', 'Both'
