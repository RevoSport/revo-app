import os
import requests
from datetime import datetime
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
from pathlib import Path

# =====================================================
#   .ENV LADEN MET ABSOLUUT PAD
# =====================================================
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# =====================================================
#   VARIABELEN INLADEN
# =====================================================
CLIENT_ID = os.getenv("CLIENT_ID")
TENANT_ID = os.getenv("TENANT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Debug (mag later weg)
print("DEBUG CLIENT_ID:", CLIENT_ID)
print("DEBUG TENANT_ID:", TENANT_ID)
print("DEBUG CLIENT_SECRET:", CLIENT_SECRET[:5], "...")

# =====================================================
#   MICROSOFT GRAPH CONFIG
# =====================================================
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = ["https://graph.microsoft.com/.default"]
OWNER_UPN = "fredericvereecken@revosportgent.onmicrosoft.com"  # <-- jouw zakelijke M365-account


# =====================================================
#   TOKEN OPHALEN
# =====================================================
def get_access_token():
    app = ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    result = app.acquire_token_for_client(scopes=SCOPES)
    if "access_token" not in result:
        raise Exception(result.get("error_description"))
    return result["access_token"]


# =====================================================
#   HULPFUNCTIE - MAPPEN CONTROLEREN/MAKEN
# =====================================================
def ensure_folder_structure(folder_path: str, token: str):
    """
    Controleert of de opgegeven mapstructuur bestaat in OneDrive,
    en maakt de mappen aan indien nodig.
    """
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    parts = folder_path.strip("/").split("/")
    current_path = ""
    base_url = f"https://graph.microsoft.com/v1.0/users/{OWNER_UPN}/drive/root"

    for part in parts:
        current_path = f"{current_path}/{part}" if current_path else part
        url = f"{base_url}:/{current_path}"
        resp = requests.get(url, headers=headers)
        if resp.status_code == 404:  # map bestaat niet -> aanmaken
            create_url = f"{base_url}:/{current_path}:/children"
            payload = {"name": part, "folder": {}, "@microsoft.graph.conflictBehavior": "fail"}
            r = requests.post(create_url, headers=headers, json=payload)
            if r.status_code not in (200, 201):
                raise Exception(f"Kon map niet aanmaken: {current_path} - {r.text}")


# =====================================================
#   UPLOAD NAAR ONEDRIVE MET DYNAMISCHE STRUCTUUR
# =====================================================
def upload_to_onedrive(
    local_path: str,
    remote_name: str,
    patient_naam: str,
    datum: str = None,
    base_folder="RevoSport/DataLab",
):
    """
    Uploadt een bestand naar OneDrive in de structuur:
    /RevoSport/DataLab/{PatiëntNaam}/{Datum}/
    """

    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Datum automatisch invullen indien leeg
    if not datum:
        datum = datetime.today().strftime("%Y-%m-%d")

    # Volledige mapstructuur
    folder_path = f"{base_folder}/{patient_naam}/{datum}"

    # Controleer of mappen bestaan, anders aanmaken
    ensure_folder_structure(folder_path, token)

    # Uploaden
    url = f"https://graph.microsoft.com/v1.0/users/{OWNER_UPN}/drive/root:/{folder_path}/{remote_name}:/content"
    with open(local_path, "rb") as file:
        response = requests.put(url, headers=headers, data=file)

    if response.status_code in (200, 201):
        data = response.json()
        return {
            "status": "success",
            "patient": patient_naam,
            "datum": datum,
            "name": data["name"],
            "url": data["webUrl"],
            "size_kb": round(data["size"] / 1024, 2),
            "folder_path": folder_path,
        }
    else:
        raise Exception(f"Upload failed: {response.status_code} - {response.text}")
