# =====================================================
# FILE: routers/oefenschema/patient.py
# Patients voor Oefenschema Module (eigen tabel)
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import SessionLocal
from models.oefenschema import PatientOefen

router = APIRouter(prefix="/patient", tags=["Oefenschema Patients"])


# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# GET /oefenschema/patient  → lijst alle oefen-patiënten
# =====================================================
@router.get("/", response_model=list[dict])
def get_oefen_patiënten(db: Session = Depends(get_db)):
    patients = db.query(PatientOefen).order_by(PatientOefen.naam.asc()).all()

    return [
        {
            "id": p.id,
            "naam": p.naam,
            "email": p.email,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        }
        for p in patients
    ]
