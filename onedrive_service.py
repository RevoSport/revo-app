# =====================================================
# FILE: onedrive_service.py
# OneDrive service — FINAL STABLE & CORRECT VERSION
# =====================================================

import os
import requests
from fastapi import UploadFile
from dotenv import load_dotenv
from onedrive_auth import get_access_token

load_dotenv()


BASE_FOLDER = "RevoSport/Oefenschema"
TEMPLATE_FOLDER = f"{BASE_FOLDER}/Templates"
SCHEMA_FOLDER = f"{BASE_FOLDER}/Schemas"


# =====================================================
# CORRECTE SIGNATURE:
# upload_bytes(content: bytes, path: str)
# =====================================================
def upload_bytes(content: bytes, path: str, content_type: str = "application/octet-stream") -> str:

    # FAILSAFE: path moet string zijn
    if isinstance(path, (bytes, bytearray)):
        path = path.decode("utf-8")

    if not isinstance(path, str):
        raise ValueError("upload_bytes: path must be string")

    token = get_access_token()
    clean = path.lstrip("/")

    # -----------------------------------------------
    # Parent folder ensure
    # -----------------------------------------------
    folder = "/".join(clean.split("/")[:-1])
    create_url = f"https://graph.microsoft.com/v1.0/drive/root:/{folder}"

    check = requests.get(create_url, headers={"Authorization": f"Bearer {token}"})
    if check.status_code == 404:
        requests.put(
            create_url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json={},
        )

    # -----------------------------------------------
    # Upload content
    # -----------------------------------------------
    upload_url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean}:/content"

    r = requests.put(
        upload_url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": content_type},
        data=content,
    )

    if r.status_code not in (200, 201):
        raise Exception(f"OneDrive upload error {r.status_code}: {r.text}")

    return clean


# =====================================================
# DELETE FILES
# =====================================================
def delete_file(path: str):
    if not path:
        return False

    token = get_access_token()
    clean = path.lstrip("/")

    url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean}"
    r = requests.delete(url, headers={"Authorization": f"Bearer {token}"})

    return r.status_code in (204, 404)


def delete_file_if_exists(path: str):
    try:
        return delete_file(path)
    except:
        return False


# =====================================================
# DELETE FOLDER + CHILDREN
# =====================================================
def delete_folder_recursive(folder_path: str):
    token = get_access_token()
    clean = folder_path.strip("/")

    list_url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean}:/children"
    children = requests.get(list_url, headers={"Authorization": f"Bearer {token}"})

    if children.status_code == 200:
        for c in children.json().get("value", []):
            item = f"{clean}/{c['name']}"
            requests.delete(
                f"https://graph.microsoft.com/v1.0/drive/root:/{item}",
                headers={"Authorization": f"Bearer {token}"}
            )

    requests.delete(
        f"https://graph.microsoft.com/v1.0/drive/root:/{clean}",
        headers={"Authorization": f"Bearer {token}"}
    )


# =====================================================
# TEMPLATE FOTO UPLOAD
# =====================================================
async def upload_template_image_with_replace(
    template_id: int,
    oef_index: int,
    slot: int,
    file: UploadFile,
    old_path: str | None,
):
    raw = await file.read()

    timestamp = int(os.times()[4] * 1000)
    filename = f"oef_{oef_index}_foto{slot}_{timestamp}.jpg"

    full = f"{TEMPLATE_FOLDER}/{template_id}/{filename}"

    # CORRECT ARG ORDER
    new_path = upload_bytes(raw, full, content_type=file.content_type or "image/jpeg")

    if old_path:
        delete_file_if_exists(old_path)

    return new_path


# =====================================================
# PDF MODULE FOTO UPLOAD
# =====================================================
def upload_oefening_foto(patient: str, datum_iso: str, volgorde: str, slot: int, file_bytes: bytes):
    token = get_access_token()

    safe_patient = patient.replace(" ", "_").replace("/", "_")
    safe_date = datum_iso.replace("/", "-")
    safe_order = str(volgorde)

    folder = (
        f"{BASE_FOLDER}/Patients/"
        f"{safe_patient}/"
        f"{safe_date}/"
        f"Oefening_{safe_order}"
    )

    # ensure folder exists
    create_url = f"https://graph.microsoft.com/v1.0/drive/root:/{folder}"
    check = requests.get(create_url, headers={"Authorization": f"Bearer {token}"})
    if check.status_code == 404:
        requests.put(
            create_url,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={}
        )

    filename = f"foto{slot}.jpg"
    upload_url = f"https://graph.microsoft.com/v1.0/drive/root:/{folder}/{filename}:/content"

    res = requests.put(
        upload_url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "image/jpeg"},
        data=file_bytes,
    )

    if res.status_code not in (200, 201):
        raise Exception(f"OneDrive upload fout: {res.text}")

    graph_path = f"{folder}/{filename}"
    web_url = res.json().get("webUrl")

    return web_url, graph_path


# =====================================================
# INTERNAL COPY (download + upload)
# =====================================================
def copy_file(src_path: str, dst_path: str):
    token = get_access_token()

    clean_src = src_path.lstrip("/")
    clean_dst = dst_path.lstrip("/")

    download_url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean_src}:/content"

    r = requests.get(download_url, headers={"Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        raise Exception(f"OneDrive copy download error {r.status_code}: {r.text}")

    content = r.content

    # CORRECT ORDER
    uploaded_path = upload_bytes(content, clean_dst, content_type="image/jpeg")

    return uploaded_path
