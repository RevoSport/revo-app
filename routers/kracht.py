# =====================================================
# FILE: routers/kracht.py
# Revo Sport API — Populatie Krachtanalyse
# =====================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from db import get_db

from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6

router = APIRouter(prefix="/kracht", tags=["Kracht"])

# =====================================================
#   Hulpdefinities
# =====================================================

KRACHTVELDEN = [
    "kracht_quadriceps_60_l", "kracht_quadriceps_60_r",
    "kracht_hamstrings_30_l", "kracht_hamstrings_30_r",
    "kracht_hamstrings_90_90_l", "kracht_hamstrings_90_90_r",
    "kracht_nordics_l", "kracht_nordics_r",
    "kracht_soleus_l", "kracht_soleus_r",
    "kracht_abductoren_kort_l", "kracht_abductoren_kort_r",
    "kracht_adductoren_kort_l", "kracht_adductoren_kort_r",
    "kracht_abductoren_lang_l", "kracht_abductoren_lang_r",
    "kracht_adductoren_lang_l", "kracht_adductoren_lang_r",
    "kracht_exorotatoren_heup_l", "kracht_exorotatoren_heup_r",
]

# Kolomvariaties (voor faseverschillen)
ALIASES = {
    "kracht_hamstrings_90_90_l": ["kracht_hamstrings_90_l"],
    "kracht_hamstrings_90_90_r": ["kracht_hamstrings_90_r"],
}

FASES = {
    "Week 6": Week6,
    "Maand 3": Maand3,
    "Maand 4.5": Maand45,
    "Maand 6": Maand6,
}


def get_existing_column(model, field):
    """Controleer of kolom bestaat; gebruik alias indien nodig."""
    if hasattr(model, field):
        return getattr(model, field)
    for alias in ALIASES.get(field, []):
        if hasattr(model, alias):
            return getattr(model, alias)
    return None


def avg_fields(session: Session, model, fields: list[str]):
    """Gemiddelden ophalen per veld; velden die niet bestaan overslaan."""
    results = {}
    for field in fields:
        col = get_existing_column(model, field)
        if col is None:
            results[field] = None
            continue
        avg_val = session.query(func.avg(col)).filter(col.isnot(None)).scalar()
        results[field] = round(avg_val, 1) if avg_val is not None else None
    return results


def ratio(a, b):
    return round(a / b, 2) if (a is not None and b is not None and b != 0) else None


# =====================================================
#   ROUTE — Populatie Kracht
# =====================================================

@router.get("/populatie")
def get_kracht_populatie(db: Session = Depends(get_db)):
    output = {}
    for fase_naam, model in FASES.items():
        data = avg_fields(db, model, KRACHTVELDEN)

        # Ratio's
        data["ratio_H30_Q60"] = ratio(data.get("kracht_hamstrings_30_r"), data.get("kracht_quadriceps_60_r"))
        data["ratio_ADD_ABD_Kort"] = ratio(data.get("kracht_adductoren_kort_r"), data.get("kracht_abductoren_kort_r"))
        data["ratio_ADD_ABD_Lang"] = ratio(data.get("kracht_adductoren_lang_r"), data.get("kracht_abductoren_lang_r"))

        output[fase_naam] = data

    return output
