from django.shortcuts import render

# Create your views here.
# payments/views.py
import os, json
from decimal import Decimal
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from django.shortcuts import get_object_or_404, redirect
from django.utils.crypto import get_random_string
from django.utils.timezone import now, timedelta
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import OrderTransaction, OrderDownloadToken
from django.conf import settings
from .paypal_utils import get_access_token, paypal_base

import stripe
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponse, HttpResponseForbidden
from django.utils.crypto import get_random_string
from django.utils.timezone import now, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import OrderTransaction, OrderDownloadToken

FIXED_AMOUNT = Decimal("29.99")
STRIPE_FIXED_AMOUNT = 2999  # 29.99 USD in cents
STRIPE_CURRENCY = "usd"
CURRENCY = "USD"
PRIVATE_DIR = os.getenv("PRIVATE_PDF_DIR")
stripe.api_key = settings.STRIPE_SECRET_KEY

# --- Create Order API (DRF) ---
# payments/views.py (only CreateOrderAPIView updated)
@method_decorator(csrf_exempt, name='dispatch')
class CreateOrderAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        try:
            access_token = get_access_token()
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {access_token}"}
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {"currency_code": CURRENCY, "value": str(FIXED_AMOUNT)}
                }],
                "application_context": {
                    "brand_name": "Manuscript Site",
                    "landing_page": "LOGIN",          # or NO_PREFERENCE
                    "user_action": "PAY_NOW",
                    "shipping_preference": "NO_SHIPPING",
                    "return_url": request.build_absolute_uri("/api/capture-order/"),
                    "cancel_url": request.build_absolute_uri("/")
                }
            }
            r = requests.post(f"{paypal_base()}/v2/checkout/orders", headers=headers, json=payload)
            r.raise_for_status()
            data = r.json()
            # find approval URL
            approve_url = next((link["href"] for link in data["links"] if link["rel"] == "approve"), None)
            return Response({"id": data["id"], "approve_url": approve_url})
        except Exception as e:
            return Response({"error": str(e)}, status=500)



# --- Capture Order API (DRF) ---
@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(csrf_exempt, name='dispatch')
class CaptureOrderAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        order_id = request.GET.get("token")  # PayPal sends ?token=ORDERID
        if not order_id:
            return Response({"error": "missing orderID"}, status=400)

        access_token = get_access_token()
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {access_token}"}
        r = requests.post(f"{paypal_base()}/v2/checkout/orders/{order_id}/capture", headers=headers)
        data = r.json()

        if data.get("status") == "COMPLETED":
            from django.utils.crypto import get_random_string
            from django.utils.timezone import now, timedelta

            order_obj, _ = OrderTransaction.objects.get_or_create(
                order_id=order_id,
                defaults={
                    "status": "COMPLETED",
                    "amount": FIXED_AMOUNT,
                    "currency": CURRENCY
                }
            )
            token = get_random_string(48)
            expires_at = now() + timedelta(seconds=3600)
            OrderDownloadToken.objects.create(
                token=token,
                order=order_obj,
                pdf_path="construction_manual.pdf",
                expires_at=expires_at
            )

            success_url = f"/payment-success/?token={token}"
            return redirect(success_url)

        return Response(data, status=400)

# --- Webhook endpoint (DRF) ---
@method_decorator(csrf_exempt, name='dispatch')
class PayPalWebhookAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        # PayPal headers
        transmission_id = request.META.get("HTTP_PAYPAL_TRANSMISSION_ID")
        transmission_time = request.META.get("HTTP_PAYPAL_TRANSMISSION_TIME")
        cert_url = request.META.get("HTTP_PAYPAL_CERT_URL")
        auth_algo = request.META.get("HTTP_PAYPAL_AUTH_ALGO")
        transmission_sig = request.META.get("HTTP_PAYPAL_TRANSMISSION_SIG")
        webhook_id = os.getenv("PAYPAL_WEBHOOK_ID")

        event_body = request.body.decode()
        try:
            access_token = get_access_token()
            verify_url = f"{paypal_base()}/v1/notifications/verify-webhook-signature"
            payload = {
                "transmission_id": transmission_id,
                "transmission_time": transmission_time,
                "cert_url": cert_url,
                "auth_algo": auth_algo,
                "transmission_sig": transmission_sig,
                "webhook_id": webhook_id,
                "webhook_event": json.loads(event_body)
            }
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {access_token}"}
            r = requests.post(verify_url, headers=headers, json=payload)
            r.raise_for_status()
            verdict = r.json().get("verification_status")

            if verdict != "SUCCESS":
                # suspicious or invalid — acknowledge but don't process
                return Response({"status":"ignored"}, status=status.HTTP_200_OK)

            event = json.loads(event_body)
            event_type = event.get("event_type")
            if event_type == "PAYMENT.CAPTURE.COMPLETED":
                resource = event.get("resource", {})
                related_ids = resource.get("supplementary_data", {}).get("related_ids", {})
                order_id = related_ids.get("order_id")
                if order_id:
                    try:
                        order_obj = OrderTransaction.objects.get(order_id=order_id)
                        if not order_obj.downloads.filter(expires_at__gt=now()).exists():
                            token = get_random_string(48)
                            expires_at = now() + timedelta(seconds=int(os.getenv("DOWNLOAD_TOKEN_TTL_SECONDS", 3600)))
                            pdf_path = "construction_manual.pdf"
                            OrderDownloadToken.objects.create(token=token, order=order_obj, pdf_path=pdf_path, expires_at=expires_at)
                            # optionally send email to payer with link
                    except OrderTransaction.DoesNotExist:
                        pass

            return Response({"status": "processed"}, status=status.HTTP_200_OK)

        except requests.HTTPError as e:
            # log error; still return 200 so PayPal doesn't keep retrying unnecessarily
            return Response({"status":"verify_error", "detail": str(e)}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status":"server_error", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Secure download view (unchanged, regular Django view) ---
def download_pdf(request, token=None):
    td = get_object_or_404(OrderDownloadToken, token=token)
    if td.expires_at < now():
        return HttpResponse("Link expired", status=410)
    if td.used:
        return HttpResponse("Link already used", status=403)
    # mark used (one-time)
    td.used = True
    td.save()
    # file_path = os.path.join(PRIVATE_DIR, td.pdf_path)
    file_path = os.path.join(settings.BASE_DIR, settings.PAYPAL_PDF)
    if not os.path.exists(file_path):
        return HttpResponseNotFound("File not found")
    return FileResponse(open(file_path, "rb"), as_attachment=True, filename=os.path.basename(file_path))




# Create Checkout Session (called by frontend on Buy Now click)
# @method_decorator(csrf_exempt, name='dispatch')
# class CreateStripeSessionAPIView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request, format=None):
#         try:
#             # success & cancel urls - stripe will redirect users here
#             # success_url = request.build_absolute_uri("/payment-success/?token={CHECKOUT_SESSION_ID}")
#             # success_url = request.build_absolute_uri("/payment-success/?token={token}}")
#             cancel_url = request.build_absolute_uri("/")

#             session = stripe.checkout.Session.create(
#                 payment_method_types=["card"],
#                 line_items=[{
#                     "price_data": {
#                         "currency": STRIPE_CURRENCY,
#                         "product_data": {
#                             "name": "Construction Manual PDF",
#                             "description": "Construction Management — PDF"
#                         },
#                         "unit_amount": STRIPE_FIXED_AMOUNT,
#                     },
#                     "quantity": 1,
#                 }],
#                 mode="payment",
#                 success_url=request.build_absolute_uri("/payment-success/?token={CHECKOUT_SESSION_ID}"),
#                 cancel_url=cancel_url,
#                 metadata={"product": "construction_manual", "site": "construction"}
#             )
            
#             print(session)

#             order_obj, _ = OrderTransaction.objects.get_or_create(
#                 order_id=session.id,
#                 defaults={
#                     "status": "COMPLETED",
#                     "amount": STRIPE_FIXED_AMOUNT / 100,
#                     "currency": CURRENCY
#                 }
#             )
#             token = get_random_string(48)
#             expires_at = now() + timedelta(seconds=3600)
#             OrderDownloadToken.objects.create(
#                 token=token,
#                 order=order_obj,
#                 pdf_path="construction_manual.pdf",
#                 expires_at=expires_at
#             )

#             return Response({"id": session.id, "checkout_url": session.url}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # Stripe webhook to receive checkout.session.completed
# @method_decorator(csrf_exempt, name='dispatch')
# class StripeWebhookAPIView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request, format=None):
#         payload = request.body
#         sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
#         webhook_secret = settings.STRIPE_WEBHOOK_SECRET
#         try:
#             event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
#         except ValueError:
#             # Invalid payload
#             return HttpResponse(status=400)
#         except stripe.error.SignatureVerificationError:
#             return HttpResponse(status=400)

#         # Handle the checkout.session.completed event
#         if event['type'] == 'checkout.session.completed':
#             session = event['data']['object']

#             # Ensure payment succeeded
#             # For checkout.session.completed, the payment is successful.
#             # But to be safer, you can fetch PaymentIntent and inspect charges.
#             session_id = session.get('id')
#             customer_email = session.get('customer_details', {}).get('email')
#             amount_total = session.get('amount_total')  # in cents

#             # validate amount matches expected
#             amount_total = session.get('amount_total')  # in cents
#             if amount_total != STRIPE_FIXED_AMOUNT:
#                 return HttpResponse(status=200)

#             order_obj, created = OrderTransaction.objects.get_or_create(
#                 order_id=session_id,
#                 defaults={
#                     "capture_id": session.get('payment_intent'),
#                     "status": "COMPLETED",
#                     "amount": Decimal(amount_total) / 100,
#                     "currency": CURRENCY.upper(),
#                     "payer_email": customer_email
#                 }
#             )
#             if not created:
#                 # update if needed
#                 order_obj.capture_id = session.get('payment_intent')
#                 order_obj.status = "COMPLETED"
#                 order_obj.payer_email = customer_email
#                 order_obj.save()

#             # Create a OrderDownloadToken token (one-time, 1 hour)
#             token = get_random_string(48)
#             expires_at = now() + timedelta(seconds=int(os.getenv("DOWNLOAD_TOKEN_TTL_SECONDS", 3600)))
#             pdf_path = "construction_manual.pdf"
#             OrderDownloadToken.objects.create(token=token, order=order_obj, pdf_path=pdf_path, expires_at=expires_at)

#             # Optionally: send email to customer_email with download link
#             # or store the token somewhere to display on success redirect

#         # Return 200 to Stripe
#         return HttpResponse(status=200)
    

# # ye wala naya add karo
# @method_decorator(csrf_exempt, name='dispatch')
# class StripeSuccessAPIView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request, format=None):
#         session_id = request.GET.get("session_id")
#         if not session_id:
#             return Response({"error": "Missing session_id"}, status=400)

#         try:
#             order = OrderTransaction.objects.get(order_id=session_id, status="COMPLETED")
#             # get latest unused token
#             download = order.downloads.filter(used=False, expires_at__gt=now()).last()
#             if download:
#                 return redirect(f"/payment-success/?token={download.token}")
#             return Response({"message": "Payment succeeded but download not ready yet. Please wait."})
#         except OrderTransaction.DoesNotExist:
#             return Response({"error": "Order not found"}, status=404)
        

@method_decorator(csrf_exempt, name='dispatch')
class CreateStripeSessionAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        try:
            cancel_url = request.build_absolute_uri("/")
            success_url = request.build_absolute_uri("/payment-success/")

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": STRIPE_CURRENCY,
                        "product_data": {
                            "name": "Construction Manual PDF",
                            "description": "Construction Management — PDF"
                        },
                        "unit_amount": STRIPE_FIXED_AMOUNT,
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=cancel_url,
                metadata={"product": "construction_manual"}
            )

            return Response({"id": session.id, "checkout_url": session.url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            session_id = session.get('id')
            amount_total = session.get('amount_total')

            if amount_total != STRIPE_FIXED_AMOUNT:
                return HttpResponse(status=200)

            order_obj, created = OrderTransaction.objects.get_or_create(
                order_id=session_id,
                defaults={
                    "capture_id": session.get('payment_intent'),
                    "status": "COMPLETED",
                    "amount": Decimal(amount_total) / 100,
                    "currency": STRIPE_CURRENCY.upper(),
                    "payer_email": session.get('customer_details', {}).get('email')
                }
            )

            # Create download token
            token = get_random_string(48)
            expires_at = now() + timedelta(seconds=3600)
            OrderDownloadToken.objects.create(
                token=token,
                order=order_obj,
                pdf_path="construction_manual.pdf",
                expires_at=expires_at
            )

        return HttpResponse(status=200)


@method_decorator(csrf_exempt, name='dispatch')
class StripeSuccessAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        session_id = request.GET.get("session_id")
        if not session_id:
            return Response({"error": "Missing session_id"}, status=400)

        try:
            order = OrderTransaction.objects.get(order_id=session_id, status="COMPLETED")
            download = order.downloads.filter(used=False, expires_at__gt=now()).last()
            if download:
                return redirect(f"/payment-success/?token={download.token}")
            return Response({"message": "Payment processing. Please refresh in a few seconds."})
        except OrderTransaction.DoesNotExist:
            return Response({"error": "Payment not confirmed yet. Please wait."}, status=404)


@method_decorator(csrf_exempt, name='dispatch')
class GetStripeTokenAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        session_id = request.GET.get("session_id")
        if not session_id:
            return Response({"error": "Missing session_id"}, status=400)

        order = OrderTransaction.objects.get(order_id=session_id, status="COMPLETED")
        print(order)
        try:
            order = OrderTransaction.objects.get(order_id=session_id, status="COMPLETED")
            download = order.downloads.filter(used=False, expires_at__gt=now()).last()
            if download:
                return Response({"token": download.token}, status=200)
            return Response({"message": "Processing payment. Please refresh."}, status=404)
        except OrderTransaction.DoesNotExist:
            return Response({"message": "Processing payment. Please refresh."}, status=404)