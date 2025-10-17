# 📁 routers/kracht.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from db import get_db

# ✅ correcte imports
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6


router = APIRouter(prefix="/kracht", tags=["Kracht"])

# 🧮 Hulpfunctie: bereken gemiddelde voor een lijst kolommen
def avg_fields(session: Session, model, fields: list[str]):
    results = {}
    for field in fields:
        col = getattr(model, field)
        avg_value = session.query(func.avg(col)).filter(col.isnot(None)).scalar()
        results[field] = round(avg_value, 1) if avg_value is not None else None
    return results


@router.get("/populatie")
def get_kracht_populatie(db: Session = Depends(get_db)):
    krachtvelden = [
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

    fases = {
        "Week 6": Week6,
        "Maand 3": Maand3,
        "Maand 4.5": Maand45,
        "Maand 6": Maand6,
    }

    def ratio(a, b):
        return round(a / b, 2) if a and b and b != 0 else None

    result = {}

    for naam, model in fases.items():
        fase_data = avg_fields(db, model, krachtvelden)

        # 🔹 Ratio’s toevoegen direct binnen de fase
        fase_data["ratio_H30_Q60"] = ratio(
            fase_data["kracht_hamstrings_30_r"],
            fase_data["kracht_quadriceps_60_r"]
        )
        fase_data["ratio_ADD_ABD_Kort"] = ratio(
            fase_data["kracht_adductoren_kort_r"],
            fase_data["kracht_abductoren_kort_r"]
        )
        fase_data["ratio_ADD_ABD_Lang"] = ratio(
            fase_data["kracht_adductoren_lang_r"],
            fase_data["kracht_abductoren_lang_r"]
        )

        result[naam] = fase_data

    return result
