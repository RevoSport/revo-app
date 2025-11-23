# =====================================================
# FILE: routers/oefenschema/__init__.py
# Centrale bundeling van alle Oefenschema-routers
# =====================================================

from fastapi import APIRouter

# Deelrouters
from .templates import router as templates_router
from .schemas import router as schemas_router
from .mail import router as mail_router
from .pdf import router as pdf_router
from .patient import router as patient_router

# Belangrijk:
# uploads.py bevat GEEN router → bevat enkel helperfuncties
# Daarom GEEN import van uploads_router

# Hoofdrouter voor de volledige module
router = APIRouter(prefix="/oefenschema", tags=["Oefenschema Module"])

# Subrouters koppelen
router.include_router(templates_router)
router.include_router(schemas_router)
router.include_router(mail_router)
router.include_router(pdf_router)
router.include_router(patient_router)
