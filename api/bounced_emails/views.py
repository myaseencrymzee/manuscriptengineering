import json
from .models import BouncedEmail
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from api.core.helpers import is_permanently_invalid_email, is_valid_signature


class MailgunWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        event = request.data
        signature_data = request.data.get('signature', {})
        token = signature_data.get('token')
        timestamp = signature_data.get('timestamp')
        signature = signature_data.get('signature')

        if not is_valid_signature(token, timestamp, signature):
            return Response({'detail': 'Invalid signature'}, status=403)

        # Mailgun uses 'event-data' in the payload
        if "event-data" not in event:
            return Response({"detail": "Invalid payload"}, status=400)

        event_data = event["event-data"]
        recipient = event_data.get("recipient")
        delivery_status = event_data.get("delivery-status", {})
        envelope = event_data.get("envelope", {})
        message = event_data.get("message", {})
        headers = message.get("headers", {})

        # if event_type == "failed" and "permanent" in event.get("severity", ""):
        if is_permanently_invalid_email(event_data):
            try:
                reason_details = {
                    "event": event_data.get("event"),
                    "severity": event_data.get("severity"),
                    "reason": event_data.get("reason"),
                    "code": delivery_status.get("code"),
                    "bounce_type": delivery_status.get("bounce-type", ""),
                    "attempt_no": delivery_status.get("attempt-no"),
                    "description": delivery_status.get("message"),
                    "timestamp": event_data.get("timestamp"),
                    "recipient": recipient,
                    "recipient_domain": event_data.get("recipient-domain"),
                    "sender": envelope.get("sender"),
                    "sending_ip": envelope.get("sending-ip"),
                    "subject": headers.get("subject"),
                    "message_id": headers.get("message-id"),
                    "tags": event_data.get("tags", []),
                }

                BouncedEmail.objects.update_or_create(
                    email=recipient,
                    defaults={"reason": json.dumps(reason_details, indent=2)}
                )
            except Exception as e:
                print(e)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)