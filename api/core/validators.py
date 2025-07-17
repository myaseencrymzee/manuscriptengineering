import re

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.conf import settings
from rest_framework import serializers
from rest_framework.exceptions import APIException, _get_error_details
from rest_framework.views import exception_handler
from rest_framework import status



class PasswordValidator(object):
    @staticmethod
    def one_symbol(value):
        if not set("[.?~!@#$%^&*()_+{}\":-;']+$").intersection(value):
            raise serializers.ValidationError("Password should have at least one symbol")
        return value

    @staticmethod
    def lower_letter(value):
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password should have at least one lowercase letter")

        return value

    @staticmethod
    def upper_letter(value):
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password should have at least one uppercase letter")
        return value

    @staticmethod
    def number(value):
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password should have at least one numeral")
        return value

    @staticmethod
    def length(value):
        if len(value) < 8:
            raise serializers.ValidationError("This password is too short. It must contain at least 8 characters.")


class DotsValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = ("Invalid input.")
    default_code = "non_field"
    key = "validations"

    def __init__(self, detail=None, code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code

        if not isinstance(detail, dict) and not isinstance(detail, list):
            detail = {"non_field": [detail]}

        self.detail = _get_error_details(detail, code)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None and type(exc):
        if response.data.get("detail"):
            custom_response = dict(key="validations", messages={"non_field": [response.data["detail"]]})
        elif response.data.get("non_field_errors"):
            custom_response = dict(
                key="validations",
                messages={"non_field": [response.data["non_field_errors"]]},
            )
        else:
            custom_response = dict(key="validations", messages=response.data)
        response.data = custom_response
        return response

    return response

def validate_video_size(value):
    if value.size > settings.MAX_VIDEO_UPLOAD_SIZE:
        raise ValidationError(
            f'Maximum file size is {settings.MAX_VIDEO_UPLOAD_SIZE/1024/1024}MB'
        )
    return value