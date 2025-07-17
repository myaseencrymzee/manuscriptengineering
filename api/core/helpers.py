
import os
import hmac
import base64
import hashlib
from django.utils import timezone
from random import randint
from django.template.loader import get_template
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from api.core.choices import Topic
from api.subscribers.models import Subscriber
from api.subscribers.serializers import SubscriberSerializer
from api.subsriber_popup.models import SubscriptionPopup
from api.user.models import OTP
from api.core.validators import DotsValidationError
import requests


def otp_number():
    return str(randint(100000, 999999))


def get_otp_verified_token(email, secret_key):
    token_str = otp_number() + secret_key + "email=" + email
    token_str_bytes = token_str.encode("ascii")
    base64_bytes = base64.b64encode(token_str_bytes)
    base64_message = base64_bytes.decode("ascii")
    return base64_message


def decrypt_token(token):
    token_str_bytes = token.encode("ascii")
    base64_bytes = base64.b64decode(token_str_bytes)
    base64_message = base64_bytes.decode("ascii")
    code, email = base64_message.split("email=")
    return code, email


def queryDict_to_dict(qdict):
    return {k: v[0] if len(v) == 1 else v for k, v in qdict.lists()}


def ValuesQuerySetToDict(vqs):
    return [item for item in vqs]


def email_send(code, email, otp_type):
    email_subject = "Alin Marin Book Verification Code."
    if otp_type == "login":
        email_subject = "Alin Marin Book Two-Factor Authentication Code"
    text_content = email_subject
    text_template = get_template("common/email/otp-template.html")
    context_obj = {"verification_code": code, "otp_type": otp_type}
    template_content = text_template.render(context_obj)
    msg = EmailMultiAlternatives(
        email_subject, text_content, settings.DEFAULT_FROM_EMAIL, [email]
    )
    msg.attach_alternative(template_content, "text/html")
    msg.send()


def verify_otp(token, email, otp_type):
    """returns user otp and error response if found any"""
    try:
        user_otp = OTP.objects.get(verification_token=token, email=email, type=otp_type)
        if timezone.now() > user_otp.timeout:
            raise DotsValidationError("Token Expired!")
    except OTP.DoesNotExist:
        raise DotsValidationError("Generate OTP First!")
    return user_otp



def send_get_in_touch_email(name, email, phone, message):
    email_subject = "New Inquiry - Get in Touch"
    
    text_content = f"New inquiry from {name}.\n\nMessage:\n{message}"
    
    # Load the HTML template
    text_template = get_template("common/email/get-in-touch-template.html")
    
    # Context for rendering the email template
    context_obj = {
        "name": name,
        "email": email,
        "phone": phone,
        "message": message
    }
    
    # Render the template with context
    template_content = text_template.render(context_obj)
    
    # Create email message
    msg = EmailMultiAlternatives(
        email_subject, text_content, settings.DEFAULT_FROM_EMAIL, [settings.CONTACT_EMAIL]
    )
    
    # Attach the HTML content
    msg.attach_alternative(template_content, "text/html")
    
    # Send the email
    msg.send()




def send_booking_email(data):
    email_subject = "New Booking Request"
    text_content = f"Booking request from {data['full_name']}."
    
    # Load email template
    text_template = get_template("common/email/booking-template.html")
    template_content = text_template.render(data)

    msg = EmailMultiAlternatives(
        email_subject, text_content, settings.DEFAULT_FROM_EMAIL, [settings.CONTACT_EMAIL]
    )
    msg.attach_alternative(template_content, "text/html")
    msg.send()


def send_confirmation_email(data, request):
    email_subject = "Registration Sucessful"
    text_content = f"Registration Successful from {data['full_name']}."

    subscriber = Subscriber.objects.get(topic=Topic.ALL, email=data['email'])
    
    # Load email template
    text_template = get_template("common/email/registration-email.html")
    data['unsubscribe_url']=f"{request.scheme}://{request.get_host()}/unsubscribe/{subscriber.id}/"
    template_content = text_template.render(data, request)
        

    msg = EmailMultiAlternatives(
        email_subject, text_content, settings.DEFAULT_FROM_EMAIL, [data['email']]
    )
    msg.attach_alternative(template_content, "text/html")
    msg.send()


def send_services_email(recipients, service, recipient_list_ids, request):
    email_subject = f"New Topic Available: {service.title}"

    for recipient, subscriber_id in zip(recipients, recipient_list_ids):
        text_content = f"Dear Subscriber,\n\nA new topic {service.title} has been added.\n\nDescription: {service.description}\n\nTo unsubscribe, click here: {request.scheme}://{request.get_host}/unsubscribe/{subscriber_id}/\n\nBest Regards,\nYour Team"

        html_template = get_template("common/email/topic-notification.html")
        template_content = html_template.render({
            'service': service,
            'unsubscribe_url': f"{request.scheme}://{request.get_host()}/api/unsubscribe/{subscriber_id}/"
        })  

        msg = EmailMultiAlternatives(
            email_subject, text_content, settings.DEFAULT_FROM_EMAIL, [recipient]
        )
        msg.attach_alternative(template_content, "text/html")  
        msg.send()


def verify_recaptcha(token):
    secret_key = settings.RECAPTCHA_SECERET_KEY
    url = "https://www.google.com/recaptcha/api/siteverify"
    data = {
        'secret': secret_key,
        'response': token
    }
    response = requests.post(url, data=data).json()
    return response.get("success"), response.get("score")


def subscribe_user(data, topic, user):
    try:
        subscribe_rec = Subscriber.objects.get(email=data["email"], topic=topic)
        
        subscribe_rec.user = user
        subscribe_rec.name = data["full_name"]
        subscribe_rec.save(update_fields=['user', 'name'])
        return subscribe_rec
        
    except Subscriber.DoesNotExist:

        data['topic'] = topic
        serializer = SubscriberSerializer(data=data)
        
        if serializer.is_valid():
            subscriber = serializer.save(user=user if user else None)
            subscriber.name = data['full_name']
            subscriber.save()
            return subscriber
        else:
            raise ValueError(f"Invalid subscriber data: {serializer.errors}")
            
    except Exception as e:
        print(f"Error subscribing user: {str(e)}")


def send_welcome_email(subscriber):
    popup = SubscriptionPopup.objects.last()
    if not popup:
        return  # Optionally raise/log error

    subject = "Welcome to Alin's Community!"
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = subscriber.email

    text_content = f"""
    Hi there,

    Thank you for subscribing!
    
    You can download your free time management workbook attached to this email.

    Best regards,
    Alin
    """
    popup_lead_magnet_image = f"{settings.BASE_URL}{popup.lead_magnet_image.url}"

    html_content = get_template("common/email/subscriber_welcome_email.html").render({
        'subscriber': subscriber,
        'popup_lead_magnet_image': popup_lead_magnet_image,
    })

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
    msg.attach_alternative(html_content, "text/html")

    # Attach the lead magnet PDF
    if popup.lead_magnet_pdf:
        with open(popup.lead_magnet_pdf.path, 'rb') as pdf:
            msg.attach(os.path.basename(popup.lead_magnet_pdf.name), pdf.read(), 'application/pdf')

    msg.send()


def is_valid_signature(token: str, timestamp: str, signature: str) -> bool:

    if not token or not timestamp or not signature:
        return False

    message = f'{timestamp}{token}'.encode('utf-8')
    key = settings.MAILGUN_WEBHOOK_SIGNING_KEY.encode('utf-8')

    expected_signature = hmac.new(key, msg=message, digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_signature, signature)


def is_permanently_invalid_email(event_data: dict) -> bool:
    # Accept both failed and bounced events
    if event_data.get("event") not in ["failed", "bounced"]:
        return False

    # Require permanent severity for failed events
    if event_data.get("event") == "failed" and event_data.get("severity") != "permanent":
        return False
    
    # For bounced events, check bounce type
    if event_data.get("event") == "bounced":
        delivery_status = event_data.get("delivery-status", {})
        bounce_type = delivery_status.get("bounce-type", "")
        if bounce_type != "hard":
            return False
    

    # Get all relevant fields that might contain useful information
    reason = event_data.get("reason", "").lower()
    delivery_status = event_data.get("delivery-status", {})
    code = str(delivery_status.get("code", ""))
    description = delivery_status.get("message", "").lower()
    
    # Combine all text fields for more thorough scanning
    full_text = f"{reason} {description} {delivery_status.get('description', '').lower()}"
    
    # Check for specific reasons that indicate invalid emails
    invalid_reasons = {"bounce", "suppress-bounce", "generic", "rejected"}
    if reason and reason not in invalid_reasons:
        return False
    
    # More precise SMTP code checking for invalid recipients
    invalid_codes = ["550", "551", "553", "554", "5.1.1", "5.1.2", "5.1.3", "5.1.0"]
    
    # Check for exact code matches
    is_invalid_code = code in invalid_codes or any(code.startswith(c) for c in ["510", "511", "512", "513", "514", "521", "523", "525"])
    
    # Comprehensive list of invalid indicators
    known_invalid_indicators = [
        "user unknown",
        "no such user",
        "recipient address rejected",
        "mailbox unavailable",
        "no mx",
        "host not found", 
        "domain does not exist",
        "no such host",
        "unrouteable address",
        "does not exist",
        "invalid recipient",
        "recipient not found",
        "user not found",
        "unknown user",
        "not delivering"
    ]
    
    # Special case for non-existent domains
    domain_invalid = False
    domain_indicators = ["no mx", "no such host", "domain does not exist", "host not found"]
    
    if any(indicator in full_text for indicator in domain_indicators):
        domain_invalid = True
    
    # Return true if we have strong indicators of an invalid email
    return is_invalid_code or domain_invalid or any(indicator in full_text for indicator in known_invalid_indicators)