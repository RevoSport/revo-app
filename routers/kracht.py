# =====================================================
# FILE: routers/kracht.py
# Revo Sport — Dynamische krachtanalyse
# =====================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from models import week6, maand3, maand45, maand6
from models.blessure import Blessure
import statistics

router = APIRouter(prefix="/kracht", tags=["Kracht"])

# -----------------------------------------------------
# Helper functies
# -----------------------------------------------------

def avg_safe(values):
    vals = [v for v in values if v not in (None, 0)]
    return round(statistics.mean(vals), 1) if vals else None

def perc_diff(op, he):
    vals = []
    for o, h in zip(op, he):
        if o and h and h != 0:
            vals.append((o - h) / h * 100)
    return round(statistics.mean(vals), 1) if vals else None

def get_side_values(row, base_name, operated_is_left: bool):
    left = getattr(row, f"{base_name}_l", None)
    right = getattr(row, f"{base_name}_r", None)
    operated = left if operated_is_left else right
    healthy = right if operated_is_left else left
    return operated, healthy

# -----------------------------------------------------
# Dynamische detectie van krachtvelden
# -----------------------------------------------------
def get_common_strength_tests():
    fases = [week6.Week6, maand3.Maand3, maand45.Maand45, maand6.Maand6]
    sets = []
    for model in fases:
        fields = [c.name for c in model.__table__.columns if c.name.startswith("kracht_")]
        # verwijder _l/_r om basisnamen te vinden
        bases = set(f[:-2] for f in fields if f.endswith("_l") or f.endswith("_r"))
        sets.append(bases)
    # enkel testen die in ALLE fases voorkomen
    common = set.intersection(*sets)
    return sorted(list(common))

# -----------------------------------------------------
# Hoofdfunctie
# -----------------------------------------------------
@router.get("/summary")
def get_kracht_summary(db: Session = Depends(get_db)):
    fases = {
        "Week 6": week6.Week6,
        "Maand 3": maand3.Maand3,
        "Maand 4.5": maand45.Maand45,
        "Maand 6": maand6.Maand6,
    }

    blessure_zijde = {b.blessure_id: b.zijde for b in db.query(Blessure).all()}
    common_tests = get_common_strength_tests()

    result = []

    for fase_label, model in fases.items():
        rows = db.query(model).all()
        fase_data = {"fase": fase_label, "tests": {}, "ratios": {}}

        # ========== SPIERTESTEN ==========
        for base in common_tests:
            operated_vals, healthy_vals = [], []

            for r in rows:
                side = blessure_zijde.get(r.blessure_id)
                if side not in ("Links", "Rechts"):
                    continue
                operated_is_left = (side == "Links")
                op, he = get_side_values(r, base, operated_is_left)
                operated_vals.append(op)
                healthy_vals.append(he)

            op_avg = avg_safe(operated_vals)
            he_avg = avg_safe(healthy_vals)
            diff = perc_diff(operated_vals, healthy_vals)

            fase_data["tests"][base] = {
                "operated_avg": op_avg,
                "healthy_avg": he_avg,
                "diff_pct": diff,
            }

        # ========== RATIO'S ==========
        def ratio_pair(base_a, base_b, name):
            """Hulp: bereken ratio op operatie- en gezonde zijde"""
            op_a = [get_side_values(r, base_a, blessure_zijde.get(r.blessure_id) == "Links")[0] for r in rows]
            he_a = [get_side_values(r, base_a, blessure_zijde.get(r.blessure_id) == "Links")[1] for r in rows]
            op_b = [get_side_values(r, base_b, blessure_zijde.get(r.blessure_id) == "Links")[0] for r in rows]
            he_b = [get_side_values(r, base_b, blessure_zijde.get(r.blessure_id) == "Links")[1] for r in rows]

            ratio_op = [
                (a / b) if a and b and b != 0 else None for a, b in zip(op_a, op_b)
            ]
            ratio_he = [
                (a / b) if a and b and b != 0 else None for a, b in zip(he_a, he_b)
            ]

            op_avg = avg_safe(ratio_op)
            he_avg = avg_safe(ratio_he)
            diff = perc_diff(ratio_op, ratio_he)

            fase_data["ratios"][name] = {
                "operated_avg": op_avg,
                "healthy_avg": he_avg,
                "diff_pct": diff,
            }

        # H/Q
        if {"kracht_hamstrings_30", "kracht_quadriceps_60"}.issubset(common_tests):
            ratio_pair("kracht_hamstrings_30", "kracht_quadriceps_60", "H30_Q60")

        # ADD/ABD kort
        if {"kracht_adductoren_kort", "kracht_abductoren_kort"}.issubset(common_tests):
            ratio_pair("kracht_adductoren_kort", "kracht_abductoren_kort", "ADD_ABD_Kort")

        # ADD/ABD lang
        if {"kracht_adductoren_lang", "kracht_abductoren_lang"}.issubset(common_tests):
            ratio_pair("kracht_adductoren_lang", "kracht_abductoren_lang", "ADD_ABD_Lang")

        result.append(fase_data)

    return result
