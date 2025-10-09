from fastapi import APIRouter
from onedrive_service import upload_to_onedrive
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/onedrive", tags=["OneDrive"])

@router.post("/upload_test")
def upload_test_file():
    """
    Test: maakt een dummy PDF en uploadt deze automatisch naar OneDrive.
    """
    os.makedirs("pdfs", exist_ok=True)
    local_path = "pdfs/test_upload.pdf"

    # --- 1. Dummy PDF genereren ---
    c = canvas.Canvas(local_path, pagesize=A4)
    c.drawString(100, 800, "RevoSport OneDrive upload test via router")
    c.drawString(100, 780, "Automatisch gegenereerd PDF-bestand")
    c.save()

    # --- 2. Upload naar OneDrive ---
    result = upload_to_onedrive(local_path, "TestUpload_RevoSport.pdf")

    return {"status": "success", "data": result}
