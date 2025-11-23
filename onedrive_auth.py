# =====================================================
# FILE: onedrive_auth.py
# Centrale Microsoft Graph tokenservice (client credentials)
# =====================================================

import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = os.getenv("TENANT_ID")
SCOPE = "https://graph.microsoft.com/.default"

TOKEN_CACHE = {
    "access_token": None,
    "expires_at": None,
}


def get_access_token():
    """
    Haalt een access token op via client_credentials.
    Cached token tot ±5 min voor verval.
    """
    # Token nog geldig?
    if (
        TOKEN_CACHE["access_token"]
        and TOKEN_CACHE["expires_at"]
        and TOKEN_CACHE["expires_at"] > datetime.utcnow()
    ):
        return TOKEN_CACHE["access_token"]

    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"

    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": SCOPE,
        "grant_type": "client_credentials",
    }

    response = requests.post(url, data=data)
    response.raise_for_status()

    token_data = response.json()

    access_token = token_data["access_token"]
    expires_in = token_data["expires_in"]

    # Vervaltijd = nu + expires_in – 300s buffer
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in - 300)

    TOKEN_CACHE["access_token"] = access_token
    TOKEN_CACHE["expires_at"] = expires_at

    return access_token
