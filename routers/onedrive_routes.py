# =====================================================
# FILE: routers/onedrive_routes.py
# Revo Sport — OneDrive Upload Routes (ownerless mode)
# =====================================================

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from onedrive_service import upload_bytes, upload_file, upload_oefening_foto
import os

router = APIRouter(prefix="/onedrive", tags=["OneDrive"])


# =====================================================
# 🔹 1️⃣ TEST-UPLOAD NAAR ONEDRIVE
# =====================================================
@router.post("/upload_test")
def upload_test_file():
    """
    Upload een klein testbestand naar OneDrive om de verbinding te controleren.
    Schrijft naar de OneDrive van de App-Owner (ownerless mode).
    """
    try:
        local_path = "static/test.pdf"

        if not os.path.exists(local_path):
            raise HTTPException(
                status_code=404,
                detail="Testbestand niet gevonden in /static (verwacht: test.pdf)"
            )

        with open(local_path, "rb") as f:
            file_bytes = f.read()

        remote_path = "RevoSport/Oefenschema/TestUploads/RevoSport_TestUpload.pdf"

        graph_path = upload_bytes(remote_path, file_bytes, content_type="application/pdf")

        return {
            "status": "ok",
            "graph_path": graph_path,
            "remote_path": remote_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Test-upload mislukt: {str(e)}")


# =====================================================
# 🔹 2️⃣ GENERIEKE PDF-UPLOAD (Debug/Test)
# =====================================================
@router.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload een PDF naar OneDrive (ownerless → drive.root).
    """
    try:
        content = await file.read()

        remote_path = f"RevoSport/Oefenschema/Debug/{file.filename}"

        graph_path = upload_bytes(remote_path, content, content_type="application/pdf")

        return {
            "status": "ok",
            "graph_path": graph_path,
            "remote_path": remote_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ PDF-upload mislukt: {str(e)}")


# =====================================================
# 🔹 3️⃣ GENERIEKE FOTO-UPLOAD
# =====================================================
@router.post("/upload_foto")
async def upload_foto(file: UploadFile = File(...)):
    """
    Upload een willekeurige foto (JPEG/PNG). Debug/test endpoint.
    """
    try:
        content = await file.read()

        remote_path = f"RevoSport/Oefenschema/Debug/{file.filename}"

        graph_path = upload_bytes(remote_path, content, content_type=file.content_type)

        return {
            "status": "ok",
            "graph_path": graph_path,
            "remote_path": remote_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Fout bij foto-upload: {str(e)}")


# =====================================================
# 🔹 4️⃣ PRODUCTIE: FOTO-UPLOAD VOOR OEFENSCHEMA
# =====================================================
@router.post("/upload-oefening-foto")
async def upload_oefening_foto_route(
    patient: str = Form(...),
    datum: str = Form(...),      # FE stuurt ISO 'YYYY-MM-DD'
    volgorde: str = Form(...),
    slot: int = Form(...),
    file: UploadFile = File(...)
):
    """
    Zet oefenfoto realtime op OneDrive:
    RevoSport/Oefenschema/Patients/<patient>/<datum>/Oefening_<volgorde>/foto<slot>.jpg

    Returns:
        - web_url   (share link)
        - graph_path (intern OneDrive path)
    """
    try:
        file_bytes = await file.read()

        web_url, graph_path = upload_oefening_foto(
            patient=patient,
            datum_iso=datum,
            volgorde=volgorde,
            slot=slot,
            file_bytes=file_bytes
        )

        return {
            "status": "ok",
            "web_url": web_url,
            "graph_path": graph_path
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"❌ Fout bij oefenfoto-upload: {e}"
        )
