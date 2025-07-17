from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from api.core.choices import OTPTypes, Roles, CharFieldSizes
from api.core.abstract import BaseModel
# Create your models here.


class UserManager(BaseUserManager):
    """Custom manager for the User model."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", Roles.USER)
        print(extra_fields["role"])
        # print(extra_fields['full_name'])
        if extra_fields['role'] == Roles.ADMIN:
            extra_fields.setdefault("full_name", email.split("@")[0])
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with an email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Roles.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, BaseModel):

    username = None
    first_name = None
    last_name = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=CharFieldSizes.SMALL)
    role = models.CharField(choices=Roles.choices, max_length=5, default=Roles.USER)
    profile_picture = models.ImageField(
        upload_to="profiles/",
        default=settings.DEFAULT_PROFILE_IMAGE,
        null=True,
        blank=True,
    )

    objects = UserManager()

    def __str__(self):
        return F"{self.full_name} - {self.email}"


class OTP(BaseModel):

    email = models.EmailField(max_length=100)
    code = models.IntegerField(null=True)
    type = models.CharField(max_length=100, null=True, choices=OTPTypes.choices, blank=True)
    verification_token = models.CharField(max_length=200, null=True)
    used = models.BooleanField(default=False, null=True)
    timeout = models.DateTimeField(null=True)

    def __str__(self):
        return self.email
