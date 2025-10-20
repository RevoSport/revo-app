# =====================================================
# FILE: routers/individueel.py
# Revo Sport API — Individuele Analyse per Patiënt
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db

from models.patienten import Patienten
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
    "Maand 6": Maand6,
}

# =====================================================
# 🔹 Helper: fetch fase data voor 1 patiënt
# =====================================================
def get_fase_data(db: Session, patient_id: int):
    data = {}
    for fase, model in FASES.items():
        fase_data = db.query(model).filter(model.patient_id == patient_id).first()
        if fase_data:
            data[fase] = fase_data
    return data


# =====================================================
# 🔹 GET /individueel/{patient_id}/dashboard
# =====================================================
@router.get("/{patient_id}/dashboard")
def get_individueel_dashboard(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patienten).filter(Patienten.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    fases = get_fase_data(db, patient_id)

    return {
        "patient": {
            "id": patient.id,
            "naam": f"{patient.voornaam} {patient.achternaam}",
            "geslacht": patient.geslacht,
            "geboortedatum": patient.geboortedatum,
            "operatiedatum": getattr(patient, "operatiedatum", None),
            "blessure": getattr(patient, "blessure", None),
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
        # Voeg hier je krachtwaarden toe, bv:
        result.append({
            "fase": fase,
            "quadriceps_60_geopereerd": getattr(data, "quadriceps_60_geo", None),
            "quadriceps_60_gezond": getattr(data, "quadriceps_60_gez", None),
            "hamstrings_30_geopereerd": getattr(data, "hamstrings_30_geo", None),
            "hamstrings_30_gezond": getattr(data, "hamstrings_30_gez", None),
        })

    return result


# =====================================================
# 🔹 GET /individueel/{patient_id}/metrics
# =====================================================
@router.get("/{patient_id}/metrics")
def get_individueel_metrics(patient_id: int, db: Session = Depends(get_db)):
    fases = get_fase_data(db, patient_id)
    # Kan later uitgebreid worden met ROM, omtrek, mobiliteit, enz.
    return fases


# =====================================================
# 🔹 GET /individueel/{patient_id}/functioneel
# =====================================================
@router.get("/{patient_id}/functioneel")
def get_individueel_functioneel(patient_id: int, db: Session = Depends(get_db)):
    fases = get_fase_data(db, patient_id)
    # Voeg functionele testen toe (bv. hoptesten)
    return fases
