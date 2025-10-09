from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.patient import Patient
from schemas.patient import PatientSchema
from routers.utils import ok, warn

router = APIRouter(prefix="/patients", tags=["Patiënten"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[PatientSchema])
def list_patients(db: Session = Depends(get_db)):
    items = db.query(Patient).all()
    ok(f"[PATIENT] {len(items)} records opgehaald")
    return items

@router.get("/{patient_id}", response_model=PatientSchema)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    obj = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not obj:
        warn(f"[PATIENT] Niet gevonden (patient_id={patient_id})")
        raise HTTPException(404, "Patiënt niet gevonden")
    ok(f"[PATIENT] Record opgehaald (patient_id={patient_id})")
    return obj

@router.post("/", response_model=PatientSchema)
def create_patient(data: PatientSchema, db: Session = Depends(get_db)):
    allowed = {"naam", "geslacht", "geboortedatum"}
    payload = {k: v for k, v in data.dict().items() if k in allowed}
    obj = Patient(**payload)
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[PATIENT] Nieuw record aangemaakt (patient_id={obj.patient_id})")
    return obj

@router.put("/{patient_id}", response_model=PatientSchema)
def update_patient(patient_id: int, data: PatientSchema, db: Session = Depends(get_db)):
    obj = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not obj:
        warn(f"[PATIENT] Niet gevonden voor update (patient_id={patient_id})")
        raise HTTPException(404, "Patiënt niet gevonden")
    allowed = {"naam", "geslacht", "geboortedatum"}
    for k, v in data.dict(exclude_unset=True).items():
        if k in allowed:
            setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[PATIENT] Record geüpdatet (patient_id={patient_id})")
    return obj

@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    obj = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not obj:
        warn(f"[PATIENT] Niet gevonden voor delete (patient_id={patient_id})")
        raise HTTPException(404, "Patiënt niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[PATIENT] Record verwijderd (patient_id={patient_id})")
    return {"status": "✅ Patiënt verwijderd"}
