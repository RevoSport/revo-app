# =====================================================
# FILE: routers/individueel.py
# Revo Sport API — Individuele Analyse per Patiënt
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db

from models.patient import Patient
from models.blessure import Blessure
from models.baseline import Baseline
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6

router = APIRouter(prefix="/individueel", tags=["Individueel"])

FASES = {
    "Baseline": Baseline,
    "Week 6": Week6,
    "Maand 3": Maand3,
    "Maand 4.5": Maand45,
    "Maand 6": Maand6
}

# =====================================================
# 🔹 Helper: fetch fase data voor 1 patiënt
# =====================================================
def get_fase_data(db: Session, patient_id: int):
    data = {}

    blessures = db.query(Blessure).filter(Blessure.patient_id == patient_id).all()
    if not blessures:
        return data

    for blessure in blessures:
        for fase, model in FASES.items():
            fase_data = db.query(model).filter(model.blessure_id == blessure.blessure_id).first()
            if fase_data:
                data[f"{fase} (Blessure {blessure.blessure_id})"] = fase_data
    return data


# =====================================================
# 🔹 GET /individueel/{patient_id}/dashboard
# =====================================================
@router.get("/{patient_id}/dashboard")
def get_individueel_dashboard(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    blessure = db.query(Blessure).filter(Blessure.patient_id == patient_id).first()
    fases = get_fase_data(db, patient_id)

    return {
        "patient": {
            "id": patient.patient_id,
            "naam": getattr(patient, "naam", None),
            "geslacht": getattr(patient, "geslacht", None),
            "geboortedatum": getattr(patient, "geboortedatum", None),
            "operatiedatum": getattr(blessure, "datum_operatie", None) if blessure else None,
            "blessure_id": blessure.blessure_id if blessure else None,
        },
        "aanwezige_fases": list(fases.keys()),
        "aantal_fases": len(fases),
    }


# =====================================================
# 🔹 GET /individueel/{patient_id}/kracht
# =====================================================
@router.get("/{patient_id}/kracht")
def get_individueel_kracht(patient_id: int, db: Session = Depends(get_db)):
    fases = get_fase_data(db, patient_id)
    result = []

    for fase, data in fases.items():
        result.append({
            "fase": fase,
            "quadriceps_60_geopereerd": getattr(data, "kracht_quadriceps_60_r", None),
            "quadriceps_60_gezond": getattr(data, "kracht_quadriceps_60_l", None),
            "hamstrings_30_geopereerd": getattr(data, "kracht_hamstrings_30_r", None),
            "hamstrings_30_gezond": getattr(data, "kracht_hamstrings_30_l", None),
        })

    return result


# =====================================================
# 🔹 GET /individueel/{patient_id}/metrics
# =====================================================
@router.get("/{patient_id}/metrics")
def get_individueel_metrics(patient_id: int, db: Session = Depends(get_db)):
    return get_fase_data(db, patient_id)


# =====================================================
# 🔹 GET /individueel/{patient_id}/functioneel
# =====================================================
@router.get("/{patient_id}/functioneel")
def get_individueel_functioneel(patient_id: int, db: Session = Depends(get_db)):
    return get_fase_data(db, patient_id)


# =====================================================
# 🔹 GET /individueel/{patient_id}/summary
# =====================================================
@router.get("/{patient_id}/summary")
def get_individueel_summary(patient_id: int, db: Session = Depends(get_db)):
    """
    Kort overzicht per patiënt:
    - aantal blessures
    - aantal fases met data
    - laatste testdatum + bijhorende fase
    """
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    blessures = db.query(Blessure).filter(Blessure.patient_id == patient_id).all()
    if not blessures:
        return {
            "patient_id": patient_id,
            "naam": patient.naam,
            "aantal_blessures": 0,
            "aantal_fases": 0,
            "laatste_testdatum": None,
            "laatste_fase": None,
            "status": "Geen blessuredata beschikbaar"
        }

    fases_data = get_fase_data(db, patient_id)

    # Zoek laatste testdatum én fase
    laatste_datum = None
    laatste_fase = None
    for fase_naam, fase_obj in fases_data.items():
        if hasattr(fase_obj, "datum_onderzoek") and getattr(fase_obj, "datum_onderzoek"):
            if not laatste_datum or fase_obj.datum_onderzoek > laatste_datum:
                laatste_datum = fase_obj.datum_onderzoek
                laatste_fase = fase_naam

    return {
        "patient_id": patient.patient_id,
        "naam": patient.naam,
        "aantal_blessures": len(blessures),
        "aantal_fases": len(fases_data),
        "laatste_testdatum": laatste_datum,
        "laatste_fase": laatste_fase,
        "status": "Actieve revalidatie" if fases_data else "Nog geen testdata"
    }
