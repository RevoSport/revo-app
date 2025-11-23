# =====================================================
# FILE: onedrive_service.py
# Centrale OneDrive service voor RevoSport Oefenschema's
# Ownerless mode — schrijft altijd naar de OneDrive
# van de Azure Graph App Owner (zoals vroeger)
# =====================================================

import os
import requests
from fastapi import UploadFile
from dotenv import load_dotenv

from onedrive_auth import get_access_token

load_dotenv()

# =====================================================
# OneDrive padconfiguratie
# =====================================================

BASE_FOLDER = "RevoSport/Oefenschema"
TEMPLATE_FOLDER = f"{BASE_FOLDER}/Templates"
SCHEMA_FOLDER = f"{BASE_FOLDER}/Schemas"


# =====================================================
# Upload RAW bytes → OneDrive
# =====================================================
def upload_bytes(path: str, content: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Upload bytes naar OneDrive (app-owner drive).
    """
    token = get_access_token()
    clean = path.lstrip("/")

    url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean}:/content"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": content_type,
    }

    r = requests.put(url, headers=headers, data=content)

    if r.status_code not in (200, 201):
        raise Exception(f"OneDrive upload mislukt ({r.status_code}): {r.text}")

    return clean   # opslaan in je database


# =====================================================
# Upload UploadFile → OneDrive
# =====================================================
async def upload_file(path: str, file: UploadFile) -> str:
    data = await file.read()
    ctype = file.content_type or "application/octet-stream"
    return upload_bytes(path, data, ctype)


# =====================================================
# Folder verwijderen
# =====================================================
def delete_folder(folder_path: str):
    """
    Verwijdert een volledige map op de OneDrive van de app-owner.
    """
    token = get_access_token()
    clean = folder_path.strip("/")

    url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean}"

    r = requests.delete(url, headers={"Authorization": f"Bearer {token}"})

    if r.status_code not in (204, 404):
        raise Exception(f"Folder verwijderen mislukt ({r.status_code}): {r.text}")


# =====================================================
# Hulpfuncties voor paden
# =====================================================

def schema_file_path(schema_id: int, filename: str) -> str:
    return f"{SCHEMA_FOLDER}/{schema_id}/{filename}"


def template_file_path(template_id: int, filename: str) -> str:
    return f"{TEMPLATE_FOLDER}/{template_id}/{filename}"


# =====================================================
# FOTO-UPLOAD VOOR OEFENSCHEMA (Patients/<Patiënt>/<Datum>)
# =====================================================

def upload_oefening_foto(patient: str, datum_iso: str, volgorde: str, slot: int, file_bytes: bytes):
    """
    Upload oefenfoto:
    RevoSport/Oefenschema/Patients/<PATIËNT>/<YYYY-MM-DD>/Oefening_<volgorde>/foto<slot>.jpg
    """

    token = get_access_token()

    safe_patient = patient.replace(" ", "_").replace("/", "_")
    safe_datum = datum_iso.replace("/", "-")
    safe_volgorde = str(volgorde)

    folder_path = (
        f"{BASE_FOLDER}/Patients/"
        f"{safe_patient}/"
        f"{safe_datum}/"
        f"Oefening_{safe_volgorde}"
    )

    # map aanmaken indien nodig
    create_url = f"https://graph.microsoft.com/v1.0/drive/root:/{folder_path}"
    check = requests.get(create_url, headers={"Authorization": f"Bearer {token}"})

    if check.status_code == 404:
        requests.put(create_url, headers={"Authorization": f"Bearer {token}"})

    filename = f"foto{slot}.jpg"

    upload_url = (
        f"https://graph.microsoft.com/v1.0/drive/root:/{folder_path}/{filename}:/content"
    )

    res = requests.put(
        upload_url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "image/jpeg"},
        data=file_bytes
    )

    if res.status_code not in (200, 201):
        raise Exception(f"OneDrive upload fout: {res.text}")

    data = res.json()
    web_url = data.get("webUrl")
    graph_path = f"{folder_path}/{filename}"

    return web_url, graph_path
