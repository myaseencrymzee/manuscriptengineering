"""
Django Mailgun API Email Backend

This file contains a custom email backend for Django that uses the Mailgun API
instead of SMTP to send emails.
"""

import requests
from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail.message import sanitize_address


class MailgunAPIEmailBackend(BaseEmailBackend):
    """
    A Django Email backend that uses the Mailgun API.
    """
    
    def __init__(self, fail_silently=False, *args, **kwargs):
        super().__init__(fail_silently=fail_silently, *args, **kwargs)
        self.api_key = getattr(settings, "MAILGUN_API_KEY", "")
        self.api_url = f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages"
        
    def send_messages(self, email_messages):
        """
        Send one or more EmailMessage objects and return the number of messages sent.
        """
        if not email_messages:
            return 0
            
        num_sent = 0
        for message in email_messages:
            sent = self._send(message)
            if sent:
                num_sent += 1
                
        return num_sent
        
    def _send(self, email_message):
        """
        Send a single email message via Mailgun API.
        """
        if not email_message.recipients():
            return False
            
        try:
            from_email = sanitize_address(email_message.from_email, email_message.encoding)
            recipients = [sanitize_address(addr, email_message.encoding) for addr in email_message.recipients()]
            
            data = {
                "from": from_email,
                "to": recipients,
                "subject": email_message.subject,
            }
            
            # Handle different message types (plain text / HTML)
            if email_message.content_subtype == "html":
                data["html"] = email_message.body
                # Also include a text version for better email client compatibility
                data["text"] = "Please view this email with an HTML-compatible email client."
            else:
                data["text"] = email_message.body
                
            # Handle EmailMultiAlternatives with both text and HTML versions
            if hasattr(email_message, 'alternatives') and email_message.alternatives:
                for content, mimetype in email_message.alternatives:
                    if mimetype == 'text/html':
                        data["html"] = content
                        # Make sure we have a text version as well
                        if "text" not in data:
                            data["text"] = "Please view this email with an HTML-compatible email client."
                
            # Handle CC and BCC
            if email_message.cc:
                data["cc"] = [sanitize_address(addr, email_message.encoding) for addr in email_message.cc]
            if email_message.bcc:
                data["bcc"] = [sanitize_address(addr, email_message.encoding) for addr in email_message.bcc]
                
            # Handle attachments
            files = []
            if email_message.attachments:
                for attachment in email_message.attachments:
                    if isinstance(attachment, tuple):
                        name, content, mimetype = attachment
                        if mimetype:
                            files.append(("attachment", (name, content, mimetype)))
                        else:
                            files.append(("attachment", (name, content)))
                    else:
                        # This case handles MIMEBase attachments or others
                        # Not implemented here for simplicity
                        pass
                        
            # Handle reply-to
            if email_message.reply_to:
                data["h:Reply-To"] = ", ".join(sanitize_address(addr, email_message.encoding) 
                                           for addr in email_message.reply_to)
                                           
            # Send the request to Mailgun
            response = requests.post(
                self.api_url,
                auth=("api", self.api_key),
                data=data,
                files=files
            )
            
            return response.status_code == 200
        except Exception as e:
            if not self.fail_silently:
                raise
            return False