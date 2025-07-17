from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.conf import settings
from api.notification.models import Notification
from api.core.choices import NOTIFICAITON_STATUS_CHOICES, Topic
from api.bounced_emails.models import BouncedEmail
from api.subscribers.models import Subscriber
import mimetypes


def send_notification_email(notification_id, emails, request):
    try:
        notification = Notification.objects.get(id=notification_id)
        attachment = notification.attachment
        count = 1

        # Load email template
        text_template = get_template("common/email/notification-email.html")
        
        for email in emails:
            try:
                try:
                    # Get or create subscriber (assuming you have a Subscriber model)
                    subscriber, created = Subscriber.objects.get_or_create(
                        email=email,
                        defaults={'topic': Topic.ALL}  # Set default topic if creating new
                    )
                except Exception as e :
                    print(e)
                    subscriber = Subscriber.objects.filter(email=email).first()
                
                # Prepare context with unsubscribe URL
                context = {
                    'notification': notification,
                    'unsubscribe_url': f"{request.scheme}://{request.get_host()}/unsubscribe/{subscriber.id}/"
                }
                
                # Render both text and HTML versions
                text_content = f"{notification.title}\n\n{notification.body}\n\nTo unsubscribe, visit: {context['unsubscribe_url']}"
                html_content = text_template.render(context, request)

                # Create email message
                mail = EmailMultiAlternatives(
                    notification.title, 
                    text_content, 
                    settings.DEFAULT_FROM_EMAIL,
                    [email]
                )
                mail.attach_alternative(html_content, "text/html")
                
                if attachment:
                    content_type, _ = mimetypes.guess_type(attachment.name)
                    content_type = content_type or 'application/octet-stream'
                    mail.attach(attachment.name, attachment.read(), content_type)

                mail.send()
                print(f"[VALID] {count} email sent to {email}")
            except Exception as e:
                print(f"Email to {email} failed: {e}")
                # BouncedEmail.objects.get_or_create(email=email)
            count += 1

        print("All emails processed.")
        notification.status = NOTIFICAITON_STATUS_CHOICES.SENT
        notification.save()

    except Notification.DoesNotExist:
        print(f"Notification with ID {notification_id} does not exist.")
    except Exception as e:
        print(f"Failed to send notification: {e}")
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.status = NOTIFICAITON_STATUS_CHOICES.FAILED
            notification.save()
        except Notification.DoesNotExist:
            pass
        raise e