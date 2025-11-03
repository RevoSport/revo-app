# =====================================================
# FILE: routers/kinvent.py
# Revo Sport — Kinvent Cloud API integratie (PRODUCTION ONLY)
# =====================================================

from fastapi import APIRouter, HTTPException
import requests
import base64
import os

router = APIRouter(prefix="/kinvent", tags=["Kinvent"])

# =====================================================
# 🔹 Productieconfiguratie
# =====================================================
BASE_URL = "https://api.k-invent.com"

# 🔒 Credentials uit .env (veilig bewaren!)
KINVENT_USER = os.getenv("KINVENT_USER", "frederic@revosport.be")
KINVENT_PASS = os.getenv("KINVENT_PASS", "!Frvereec1203!kinvent")


def kinvent_headers():
    """Genereer Basic Auth headers voor Kinvent Cloud API"""
    token = base64.b64encode(f"{KINVENT_USER}:{KINVENT_PASS}".encode()).decode()
    return {
        "Authorization": f"Basic {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


# =====================================================
# 🔹 1. Accountinfo ophalen
# =====================================================
@router.get("/account")
def get_account():
    url = f"{BASE_URL}/accounts"
    r = requests.get(url, headers=kinvent_headers())
    if r.status_code == 200:
        return r.json()
    raise HTTPException(status_code=r.status_code, detail=r.text)


# =====================================================
# 🔹 2. Alle patiënten ophalen
# =====================================================
@router.get("/patients")
def get_patients():
    url = f"{BASE_URL}/patients"
    r = requests.get(url, headers=kinvent_headers())
    if r.status_code == 200:
        return {"count": len(r.json()), "patients": r.json()}
    raise HTTPException(status_code=r.status_code, detail=r.text)


# =====================================================
# 🔹 3. Tests per patiënt ophalen
# =====================================================
@router.get("/patients/{patient_id}/tests")
def get_patient_tests(patient_id: str):
    url = f"{BASE_URL}/patients/{patient_id}/tests"
    r = requests.get(url, headers=kinvent_headers())
    if r.status_code == 200:
        return r.json()
    raise HTTPException(status_code=r.status_code, detail=r.text)


# =====================================================
# 🔹 4. Detail van één test ophalen
# =====================================================
@router.get("/tests/{test_id}")
def get_test_detail(test_id: str):
    url = f"{BASE_URL}/tests/{test_id}"
    r = requests.get(url, headers=kinvent_headers())
    if r.status_code == 200:
        return r.json()
    raise HTTPException(status_code=r.status_code, detail=r.text)
