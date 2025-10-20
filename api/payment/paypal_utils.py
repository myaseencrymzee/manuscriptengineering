# payments/paypal_utils.py
import os, time
import requests
from django.core.cache import cache
from django.conf import settings

def paypal_base():
    return settings.PAYPAL_BASE_URL

def get_access_token():
    token_data = cache.get("paypal_token")
    if token_data and token_data.get("expires_at", 0) > time.time() + 30:
        return token_data["access_token"]
    url = f"{paypal_base()}/v1/oauth2/token"
    r = requests.post(url, auth=(settings.CLIENT_ID, settings.CLIENT_SECRET), data={"grant_type": "client_credentials"})
    r.raise_for_status()
    data = r.json()
    expires_in = data.get("expires_in", 3200)
    cache.set("paypal_token", {"access_token": data["access_token"], "expires_at": time.time() + expires_in}, timeout=expires_in-10)
    return data["access_token"]
