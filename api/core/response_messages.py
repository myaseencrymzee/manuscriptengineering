from rest_framework import status

class CustomResponse:
    def __init__(self, code, message, http_code) -> None:
        self.code = code
        self.message = message
        self.http_code = http_code


class GlobalResponseMessages:
    un_authenticated = CustomResponse(4001, "Invalid Credentials!", status.HTTP_401_UNAUTHORIZED)
    missing_params = CustomResponse(4002, "Missing required information!", status.HTTP_400_BAD_REQUEST)
    serializer_error = CustomResponse(4004, "Serializer Error", status.HTTP_400_BAD_REQUEST)
    record_not_found = CustomResponse(4004, "Record not found!", status.HTTP_404_NOT_FOUND)
    something_went_wrong = CustomResponse(5001, "Something went wrong!", status.HTTP_503_SERVICE_UNAVAILABLE)


class OTPResponseMessage(GlobalResponseMessages):
    user_already_exists = CustomResponse(4009, "User already exists!", status.HTTP_409_CONFLICT)
    invalid_otp_type = CustomResponse(4010, "Invalid otp type!", status.HTTP_400_BAD_REQUEST)
    otp_already_used = CustomResponse(4011, "OTP is already used!", status.HTTP_401_UNAUTHORIZED)
    otp_expired = CustomResponse(4012, "OTP expired!", status.HTTP_401_UNAUTHORIZED)
    wrong_otp_code = CustomResponse(4013, "The OTP code you entered is invalid. Please enter a correct OTP code to continue.", status.HTTP_401_UNAUTHORIZED)
    verification_token_expired = CustomResponse(4005, "Token expired!", status.HTTP_401_UNAUTHORIZED)