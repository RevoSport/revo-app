# =====================================================
# FILE: routers/kracht.py
# Revo Sport API — Groepsanalyse Kracht + Ratio’s (gecombineerd)
# =====================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple
from db import get_db

# Models
from models.blessure import Blessure
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6

router = APIRouter(prefix="/kracht", tags=["Kracht"])

# -----------------------------------------------------
# Helpers
# -----------------------------------------------------

def _safe(val):
    """Converteer DECIMAL/Integer → float, filtert None en 0 (0 = ongeldig)."""
    if val is None:
        return None
    try:
        f = float(val)
    except Exception:
        return None
    return None if f == 0 else f


def _avg(values: List[float], ndigits: int = 2):
    vals = [v for v in values if v is not None]
    if not vals:
        return None
    return round(sum(vals) / len(vals), ndigits)


def _oper_gezond_sides(zijde: str) -> Tuple[str, str]:
    """Bepaal geopereerde en gezonde zijde."""
    if zijde == "Links":
        return "l", "r"
    if zijde == "Rechts":
        return "r", "l"
    return None, None

# -----------------------------------------------------
# Config per fase
# -----------------------------------------------------

COMMON_FIELDS = [
    ("Quadriceps 60", "quadriceps_60"),
    ("Hamstrings 30", "hamstrings_30"),
    ("Soleus", "soleus"),
    ("Abductoren kort", "abductoren_kort"),
    ("Abductoren lang", "abductoren_lang"),
    ("Adductoren kort", "adductoren_kort"),
    ("Adductoren lang", "adductoren_lang"),
]

EXTRA_MAAND3 = [
    ("Hamstrings 90/90", "hamstrings_90_90"),
    ("Exorotatoren heup", "exorotatoren_heup"),
]

EXTRA_MAAND45 = [
    ("Nordics", "nordics"),
]

FASES = [
    ("Week 6", Week6, COMMON_FIELDS),
    ("Maand 3", Maand3, COMMON_FIELDS + EXTRA_MAAND3),
    ("Maand 4.5", Maand45, COMMON_FIELDS + EXTRA_MAAND3 + EXTRA_MAAND45),
    ("Maand 6", Maand6, COMMON_FIELDS + EXTRA_MAAND3 + EXTRA_MAAND45),
]

COMMON_RATIOS = [
    ("H/Q", "hamstrings_30", "quadriceps_60"),
    ("ADD/ABD", "adductoren", "abductoren"),
]

# -----------------------------------------------------
# Krachtanalyse per fase
# -----------------------------------------------------

def _aggregate_phase(db: Session, fase_label: str, Model, fields: List[Tuple[str, str]]) -> Dict[str, Any]:
    rows = (
        db.query(Model, Blessure)
        .join(Blessure, Model.blessure_id == Blessure.blessure_id)
        .all()
    )

    buckets: Dict[str, Dict[str, List[float]]] = {}
    for label, base in fields:
        buckets[label] = {"oper": [], "gezond": [], "pairs": []}

    for rec, bl in rows:
        oper_side, gezond_side = _oper_gezond_sides(bl.zijde)
        if oper_side is None:
            continue

        for label, base in fields:
            attr_oper = f"kracht_{base}_{oper_side}"
            attr_gezond = f"kracht_{base}_{gezond_side}"

            if not hasattr(rec, attr_oper) or not hasattr(rec, attr_gezond):
                continue

            v_oper = _safe(getattr(rec, attr_oper, None))
            v_gez = _safe(getattr(rec, attr_gezond, None))

            if v_oper is not None:
                buckets[label]["oper"].append(v_oper)
            if v_gez is not None:
                buckets[label]["gezond"].append(v_gez)
            if v_oper is not None and v_gez is not None:
                try:
                    delta = ((v_oper - v_gez) / v_gez) * 100
                    buckets[label]["pairs"].append(delta)
                except ZeroDivisionError:
                    pass

    out = []
    for label, _ in fields:
        b = buckets[label]
        if not b["oper"] and not b["gezond"]:
            continue
        out.append({
            "spiergroep": label,
            "geopereerd_mean": _avg(b["oper"], 1),
            "gezond_mean": _avg(b["gezond"], 1),
            "verschil_pct": _avg(b["pairs"], 1),
            "n_oper": len(b["oper"]),
            "n_gezond": len(b["gezond"]),
            "n_pairs": len(b["pairs"]),
        })
    return {"fase": fase_label, "spiergroepen": out}

# -----------------------------------------------------
# Ratioanalyse per fase
# -----------------------------------------------------

def _aggregate_phase_ratios(db: Session, fase_label: str, Model, ratios: List[Tuple[str, str, str]]) -> Dict[str, Any]:
    rows = (
        db.query(Model, Blessure)
        .join(Blessure, Model.blessure_id == Blessure.blessure_id)
        .all()
    )

    buckets = {label: {"oper": [], "gezond": [], "diffs": []} for label, _, _ in ratios}

    for rec, bl in rows:
        oper_side, gezond_side = _oper_gezond_sides(bl.zijde)
        if oper_side is None:
            continue

        for label, num_base, denom_base in ratios:
            def _get_ratio(side: str):
                if label == "H/Q":
                    num = _safe(getattr(rec, f"kracht_{num_base}_{side}", None))
                    denom = _safe(getattr(rec, f"kracht_{denom_base}_{side}", None))
                elif label == "ADD/ABD":
                    num = (
                        (_safe(getattr(rec, f"kracht_{num_base}_kort_{side}", None)) or 0)
                        + (_safe(getattr(rec, f"kracht_{num_base}_lang_{side}", None)) or 0)
                    )
                    denom = (
                        (_safe(getattr(rec, f"kracht_{denom_base}_kort_{side}", None)) or 0)
                        + (_safe(getattr(rec, f"kracht_{denom_base}_lang_{side}", None)) or 0)
                    )
                    if num == 0: num = None
                    if denom == 0: denom = None
                else:
                    num, denom = None, None
                if num is None or denom is None or denom == 0:
                    return None
                return num / denom

            r_oper = _get_ratio(oper_side)
            r_gez = _get_ratio(gezond_side)

            if r_oper is not None:
                buckets[label]["oper"].append(r_oper)
            if r_gez is not None:
                buckets[label]["gezond"].append(r_gez)
            if r_oper is not None and r_gez is not None:
                diff = ((r_oper - r_gez) / r_gez) * 100
                buckets[label]["diffs"].append(diff)

    out = []
    for label, _, _ in ratios:
        b = buckets[label]
        out.append({
            "ratio": label,
            "geopereerd_mean": _avg(b["oper"], 2),
            "gezond_mean": _avg(b["gezond"], 2),
            "verschil_pct": _avg(b["diffs"], 1),
            "n_oper": len(b["oper"]),
            "n_gezond": len(b["gezond"]),
            "n_pairs": len(b["diffs"]),
        })
    return {"fase": fase_label, "ratios": out}

# -----------------------------------------------------
# Gecombineerde endpoint
# -----------------------------------------------------

@router.get("/group")
def get_group_kracht(db: Session = Depends(get_db)):
    """
    Retourneert per fase:
      - krachtgegevens (spiergroepen)
      - ratio’s (H/Q, ADD/ABD)
    """
    out = {"fases": []}
    for fase_label, Model, fields in FASES:
        fase_out = _aggregate_phase(db, fase_label, Model, fields)
        ratio_out = _aggregate_phase_ratios(db, fase_label, Model, COMMON_RATIOS)
        fase_out["ratios"] = ratio_out["ratios"]
        out["fases"].append(fase_out)
    return out
