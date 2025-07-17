from django.contrib.auth import login, logout
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.decorators import action
from api.user.serializers import *
from api.user.models import OTP
from api.core.helpers import send_get_in_touch_email, send_booking_email, subscribe_user
from django.contrib.auth import get_user_model

User = get_user_model()



class AdminLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self,request,*args, **kwargs):
        data = request.data
        serializer = AdminLoginSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.check_user(data)
        if user:
            login(request,user)
            return Response({'message': 'user logged in successfully.'},status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)

class UserLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self,request,*args, **kwargs):
        data = request.data
        serializer = UserLoginSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.check_user(data)
        if user:
            login(request,user)
            return Response({'message': 'user logged in successfully.'},status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "user logged out successfully."}, status=status.HTTP_200_OK)


class OTPViewSet(GenericViewSet):
    serializer_class = OTPSerializer
    queryset = OTP.objects.all()
    permission_classes = [AllowAny]

    @action(detail=False, methods=["POST"], url_path="send", queryset=OTP.objects.all(), serializer_class=OTPSerializer)
    def generate_otp(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"message": "OTP sent successfully."}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["PATCH"], url_path="verify", queryset=OTP.objects.all(), serializer_class=VerifyOTPSerializer)
    def verify_otp(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        otp_type = serializer.validated_data["otp_type"]
        user_otp = (OTP.objects.filter(email=email, type=otp_type).order_by("-pk").first())
        return Response({"verification_token": user_otp.verification_token}, status=status.HTTP_200_OK)


class PasswordViewSet(GenericViewSet):
    serializer_class = UpdatePasswordSerializer
    permission_classes = [IsAuthenticated]
    queryset = OTP.objects.all()

    @action(detail=False, methods=["PATCH"], url_path="update")
    def update_password(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response({"message": "Password Updated Successfully"}, status=status.HTTP_200_OK)

    @action(detail=False,methods=["PATCH"], url_path="reset", serializer_class=PasswordResetSerializer, permission_classes=[AllowAny])
    def change_password(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verification_token = serializer.validated_data.pop("verification_token")
        password = serializer.validated_data.get("password")
        otp = (OTP.objects.filter(verification_token=verification_token).order_by("-pk").first())

        if not otp:
            return Response({"message": "No Record Found Regenerate Token !"},status=status.HTTP_400_BAD_REQUEST)
        verify_otp(token=verification_token, email=otp.email, otp_type=otp.type)

        try:
            user = User.objects.get(email=otp.email)
        except User.DoesNotExist:
            return Response({"varification_token": "Invalid Token !"},status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(password)
        user.save()
        return Response({"message": "Password Changed Successfully"}, status=status.HTTP_200_OK)


class ProfileUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileUpdateSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

#user profile update
class UserProfileUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileUpdateSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



  # Import the helper function

class ContactFormView(APIView):
    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data['name']
            email = serializer.validated_data['email']
            phone = serializer.validated_data.get('phone_number', 'Not provided')
            message = serializer.validated_data['message']

            # Call the helper function to send the email
            send_get_in_touch_email(name, email, phone, message)

            return Response({"messages": "Email sent successfully"}, status=status.HTTP_200_OK)
        return Response({"messages": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    


class BookingView(APIView):
    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            send_booking_email(serializer.validated_data)  # Send email
            return Response({"message": "Booking request sent successfully!"}, status=status.HTTP_200_OK)
        return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            subscribe_user(serializer.validated_data, 'all', user)
            send_confirmation_email(serializer.validated_data, request)
            send_welcome_email(user)
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)