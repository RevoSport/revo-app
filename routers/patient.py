# =====================================================
# FILE: routers/patient.py
# Revo Sport API — Patiëntenbeheer
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from db import SessionLocal
from models.patient import Patient
from schemas.patient import PatientSchema
from routers.utils import ok, warn

router = APIRouter(prefix="/patients", tags=["Patiënten"])

# =====================================================
# 🔹 DB dependency
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔹 GET /patients — Alle patiënten + gekoppelde blessures
# =====================================================
@router.get("/", response_model=List[PatientSchema])
def list_patients(db: Session = Depends(get_db)):
    """
    Retourneert alle patiënten, inclusief hun gekoppelde blessures.
    Wordt gebruikt voor populatie- en individuele dashboards.
    """
    patients = (
        db.query(Patient)
        .options(joinedload(Patient.blessures))  # ✅ Laadt blessure-info mee
        .all()
    )

    ok(f"[PATIENT] {len(patients)} records opgehaald (met blessures)")
    return patients


# =====================================================
# 🔹 GET /patients/{id} — Specifieke patiënt
# =====================================================
@router.get("/{patient_id}", response_model=PatientSchema)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    Retourneert één patiënt op basis van ID.
    """
    obj = (
        db.query(Patient)
        .options(joinedload(Patient.blessures))
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not obj:
        warn(f"[PATIENT] Niet gevonden (patient_id={patient_id})")
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    ok(f"[PATIENT] Record opgehaald (patient_id={patient_id})")
    return obj


# =====================================================
# 🔹 POST /patients — Nieuwe patiënt
# =====================================================
@router.post("/", response_model=PatientSchema)
def create_patient(data: PatientSchema, db: Session = Depends(get_db)):
    """
    Maakt een nieuwe patiënt aan in de database.
    """
    allowed = {"voornaam", "achternaam", "geslacht", "geboortedatum"}
    payload = {k: v for k, v in data.dict().items() if k in allowed}

    obj = Patient(**payload)
    db.add(obj)
    db.commit()
    db.refresh(obj)

    ok(f"[PATIENT] Nieuw record aangemaakt (patient_id={obj.patient_id})")
    return obj


# =====================================================
# 🔹 PUT /patients/{id} — Patiënt bijwerken
# =====================================================
@router.put("/{patient_id}", response_model=PatientSchema)
def update_patient(patient_id: int, data: PatientSchema, db: Session = Depends(get_db)):
    """
    Wijzigt gegevens van een bestaande patiënt.
    """
    obj = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not obj:
        warn(f"[PATIENT] Niet gevonden voor update (patient_id={patient_id})")
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    allowed = {"voornaam", "achternaam", "geslacht", "geboortedatum"}
    for k, v in data.dict(exclude_unset=True).items():
        if k in allowed:
            setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    ok(f"[PATIENT] Record geüpdatet (patient_id={patient_id})")
    return obj


# =====================================================
# 🔹 DELETE /patients/{id} — Patiënt verwijderen
# =====================================================
@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    Verwijdert een patiënt en alle bijhorende blessure(s).
    """
    obj = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not obj:
        warn(f"[PATIENT] Niet gevonden voor delete (patient_id={patient_id})")
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    db.delete(obj)
    db.commit()

    ok(f"[PATIENT] Record verwijderd (patient_id={patient_id})")
    return {"status": "✅ Patiënt verwijderd"}
q