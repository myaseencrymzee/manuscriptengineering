from hmac import compare_digest
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework import serializers
from api.core.validators import DotsValidationError
from api.core.helpers import *
from api.user.models import OTP
from api.core.choices import *
from api.core.response_messages import OTPResponseMessage
from api.core.validators import PasswordValidator
from django.core.files.storage import default_storage
from django.contrib.auth.password_validation import validate_password
User = get_user_model()



class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        user = authenticate(username = clean_data['email'], password = clean_data['password'])

        if not user:
            raise serializers.ValidationError('An admin with the specified credentials could not be found.')
        if user and user.role != Roles.ADMIN:
            raise serializers.ValidationError('You are not authorised here.')
        
        return user
    
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        user = authenticate(username=clean_data['email'], password=clean_data['password'])

        if not user:
            raise serializers.ValidationError('User with the specified credentials could not be found.')
        if user and user.role != Roles.USER:
            raise serializers.ValidationError('You are not authorised here.')
        
        return user


class OTPSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    otp_type = serializers.ChoiceField(choices=OTPTypes.choices, write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        otp_type = attrs["otp_type"]
        if otp_type == OTPTypes.FORGOT:
            user = User.objects.filter(email=email)
            if not user.exists():
                raise DotsValidationError({"email": "This email is not registered"})
        elif otp_type == OTPTypes.CREATE:
            user = User.objects.filter(email=email)
            if user.exists():
                raise DotsValidationError({"email": "This email is already registered"})

        timeout = timezone.now() + timedelta(seconds=300) # 5 minutes time to expire otp
        code = otp_number()
        verification_token = get_otp_verified_token(email=email, secret_key=code)
        new_otp = OTP.objects.create(code=code, email=email, type=otp_type, timeout=timeout, verification_token=verification_token)
        email_send(code=new_otp.code, email=new_otp.email, otp_type=otp_type)
        return attrs


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    otp_type = serializers.ChoiceField(choices=OTPTypes.choices, write_only=True)
    otp_code = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        otp_code = attrs["otp_code"]
        otp_type = attrs["otp_type"]
        user_otp = (OTP.objects.filter(email=email, type=otp_type).order_by("-pk").first())
        
        if not user_otp:
            raise DotsValidationError({"email": "This email is not registered"})

        if str(user_otp.code) != otp_code:
            raise DotsValidationError({"otp_code": str(OTPResponseMessage.wrong_otp_code.message)})

        if user_otp.used:
            raise DotsValidationError({"otp_code": str(OTPResponseMessage.otp_already_used.message)})

        if timezone.now() > user_otp.timeout:
            raise DotsValidationError({"otp_code": str(OTPResponseMessage.otp_expired.message)})
        
        user_otp.used = True
        user_otp.timeout = timezone.now() + timedelta(seconds=300)
        user_otp.save()
        return attrs


class UpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[
            PasswordValidator.one_symbol,
            PasswordValidator.lower_letter,
            PasswordValidator.upper_letter,
            PasswordValidator.number,
            PasswordValidator.length,
        ],
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        user = self.context["request"].user
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        if not user.check_password(data.get("old_password")):
            raise serializers.ValidationError(
                {"old_password": "Incorrect old password."}
            )
        if not compare_digest(password, confirm_password):
            raise serializers.ValidationError(
                {"password": ("Password and confirm password do not match")}
            )
        user.set_password(password)
        user.save()
        request = self.context.get("request")
        if request:
            login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return data


class PasswordResetSerializer(serializers.Serializer):
    verification_token = serializers.CharField(required=True, write_only=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[
            PasswordValidator.one_symbol,
            PasswordValidator.lower_letter,
            PasswordValidator.upper_letter,
            PasswordValidator.number,
            PasswordValidator.length,
        ],
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        print(password, confirm_password)

        if not compare_digest(password, confirm_password):
            raise serializers.ValidationError({"password": ("Password and confirm password do not match")})

        return data
    

class ProfileUpdateSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=True,
        validators=[
            PasswordValidator.one_symbol,
            PasswordValidator.lower_letter,
            PasswordValidator.upper_letter,
            PasswordValidator.number,
            PasswordValidator.length,
        ],
    )

    class Meta:
        model = User
        fields = ['id', 'profile_picture', 'full_name', 'email', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'read_only': True}  
        }

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if password and password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('confirm_password', None) 
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password) 
        instance.save()

        request = self.context.get("request")
        if request:
            login(request, instance, backend="django.contrib.auth.backends.ModelBackend")
        return instance



# user profile update

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False,
        validators=[
            PasswordValidator.one_symbol,
            PasswordValidator.lower_letter,
            PasswordValidator.upper_letter,
            PasswordValidator.number,
            PasswordValidator.length,
        ],
    )

    class Meta:
        model = User
        fields = ['id', 'profile_picture', 'full_name', 'email', 'current_password', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': False},
            'full_name': {'required': False},
            'profile_picture': {'required': False}
        }

    def validate(self, data):
        user = self.instance  # Get the current user instance
        current_password = data.get('current_password', None)
        new_password = data.get('password', None)
        confirm_password = data.get('confirm_password', None)

        # Check if the provided current password is correct
        if current_password or new_password or confirm_password:
            if not user.check_password(current_password):
                raise serializers.ValidationError({"current_password": "Current password is incorrect."})

            # Validate new password and confirm password match
            if new_password and new_password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return data

    def update(self, instance, validated_data):
        validated_data.pop('current_password', None)  # Remove current password from validated data
        new_password = validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if new_password:
            instance.set_password(new_password)
        instance.save()

        request = self.context.get("request")
        if request:
            login(request, instance, backend="django.contrib.auth.backends.ModelBackend")
        return instance




class ContactFormSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    message = serializers.CharField()
    # recaptcha_token = serializers.CharField(write_only=True)

    # def validate_recaptcha_token(self, token):
    #     """
    #     Validate reCAPTCHA token using the common verification function.
    #     """
    #     success, score = verify_recaptcha(token)
    #     if not success or score < 0.5:  # Adjust the score threshold if necessary
    #         raise serializers.ValidationError("reCAPTCHA validation failed. Please try again.")

    #     return token


class authorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "profile_picture"]



class BookingSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255)
    date_time = serializers.CharField(max_length=100)
    session = serializers.ChoiceField(choices=["Coaching", "Consulting", "Speaking", "Other"])
    message = serializers.CharField()
    subscribe = serializers.BooleanField(default=False)
    # recaptcha_token = serializers.CharField(write_only=True)

    # def validate_recaptcha_token(self, token):
    #     """
    #     Validate reCAPTCHA token using the common verification function.
    #     """
    #     success, score = verify_recaptcha(token)
    #     if not success or score < 0.5:  # Adjust the score threshold if necessary
    #         raise serializers.ValidationError("reCAPTCHA validation failed. Please try again.")

    #     return token


class SignupSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    otp_type = serializers.ChoiceField(choices=OTPTypes.choices, write_only=True)
    

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'confirm_password', 'profile_picture', 'otp_type']

    def validate(self, attrs):
        email = attrs["email"]
        # otp_code = attrs["otp_code"]
        otp_type = attrs["otp_type"]
        user_otp = (OTP.objects.filter(email=email, type=otp_type, used=True).order_by("-pk").first())


        if attrs['password'] != attrs['confirm_password']:
            raise  serializers.ValidationError({"password: password do not match"})
        if not user_otp:
            raise DotsValidationError({"email": "This email is not yet verified"})
        user_otp.delete()
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data.pop('otp_type')
            
        profile_picture = validated_data.pop('profile_picture', None)
        user = User.objects.create_user(**validated_data)

        if profile_picture:
            user.profile_picture = profile_picture
            user.save()

        return user
