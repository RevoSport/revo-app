# =====================================================
# FILE: routers/functioneel.py
# Revo Sport API — Functionele & Springtesten + Hop Cluster
# =====================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple
from db import get_db

# 🔹 Models
from models.blessure import Blessure
from models.baseline import Baseline
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6

router = APIRouter(prefix="/functioneel", tags=["Functioneel"])

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
# Configuratie per fase
# -----------------------------------------------------

FUNCTIONELE_TESTEN = [
    ("Step Down – Valgus Score", "stepdown_valgus_score"),
    ("Step Down – Pelvis Controle", "stepdown_pelvische_controle"),
    ("Squat Forceplate", "squat_forceplate"),
    ("Single Hop Distance", "single_hop_distance"),
    ("Side Hop", "sidehop"),
]

CMJ_TESTEN = [
    ("CMJ 2-benig Steunname Landing", "cmj_asymmetrie"),
    ("CMJ 1-been Hoogte", "cmj_hoogte"),
    ("CMJ 2-benig Hoogte", "cmj_hoogte_2benig"),
]

DROPJUMP_TESTEN = [
    ("Drop Jump 1-been Hoogte", "dropjump_hoogte"),
    ("Drop Jump 1-been RSI", "dropjump_rsi"),
    ("Drop Jump 2-benig Steunname Landing", "dropjump_steunname_landing"),
    ("Drop Jump 2-benig Hoogte", "dropjump_hoogte_2benig"),
]

FASES = [
    ("Baseline", Baseline),
    ("Week 6", Week6),
    ("Maand 3", Maand3),
    ("Maand 4.5", Maand45),
    ("Maand 6", Maand6),
]


# -----------------------------------------------------
# Baseline categorische analyse (Lag / VMO)
# -----------------------------------------------------

def _aggregate_baseline_categorical(db: Session) -> Dict[str, Any]:
    rows = db.query(Baseline).all()
    result = {}

    def _percentages(field: str):
        vals = [getattr(r, field, None) for r in rows if getattr(r, field, None)]
        total = len(vals)
        if total == 0:
            return None
        cats = {}
        for v in vals:
            cats[v] = cats.get(v, 0) + 1
        return {k: round((v / total) * 100, 1) for k, v in cats.items()}

    result["lag_test"] = _percentages("lag_test")
    result["vmo_activatie"] = _percentages("vmo_activatie")
    return result


# -----------------------------------------------------
# Unilaterale testen (1-been) — geopereerd/gezond/%verschil
# -----------------------------------------------------

def _aggregate_unilateral_tests(db: Session, fase_label: str, Model, tests: List[Tuple[str, str]]) -> Dict[str, Any]:
    rows = (
        db.query(Model, Blessure)
        .join(Blessure, Model.blessure_id == Blessure.blessure_id)
        .all()
    )

    buckets = {label: {"oper": [], "gezond": [], "pairs": []} for label, _ in tests}

    for rec, bl in rows:
        oper_side, gez_side = _oper_gezond_sides(bl.zijde)
        if oper_side is None:
            continue

        for label, base in tests:
            attr_oper = f"{base}_{oper_side}"
            attr_gez = f"{base}_{gez_side}"

            if not hasattr(rec, attr_oper) or not hasattr(rec, attr_gez):
                continue

            v_oper = _safe(getattr(rec, attr_oper))
            v_gez = _safe(getattr(rec, attr_gez))

            if v_oper is not None:
                buckets[label]["oper"].append(v_oper)
            if v_gez is not None:
                buckets[label]["gezond"].append(v_gez)
            if v_oper is not None and v_gez is not None and v_gez != 0:
                diff = ((v_oper - v_gez) / v_gez) * 100
                buckets[label]["pairs"].append(diff)

    out = []
    for label, _ in tests:
        b = buckets[label]
        if not b["oper"] and not b["gezond"]:
            continue
        out.append({
            "test": label,
            "geopereerd_mean": _avg(b["oper"], 1),
            "gezond_mean": _avg(b["gezond"], 1),
            "verschil_pct": _avg(b["pairs"], 1),
            "n_oper": len(b["oper"]),
            "n_gezond": len(b["gezond"]),
            "n_pairs": len(b["pairs"]),
        })
    return {"fase": fase_label, "testen": out}


# -----------------------------------------------------
# Bilaterale testen (2-benig) — enkel groepsgemiddelde
# -----------------------------------------------------

def _aggregate_bilateral_tests(db: Session, fase_label: str, Model, tests: List[Tuple[str, str]]) -> Dict[str, Any]:
    rows = db.query(Model).all()
    out = []
    for label, base in tests:
        if not hasattr(Model, base):
            continue
        vals = [_safe(getattr(r, base)) for r in rows if getattr(r, base) is not None]
        out.append({
            "test": label,
            "mean": _avg(vals, 1),
            "n": len(vals)
        })
    return {"fase": fase_label, "testen": out}


# -----------------------------------------------------
# Hop Test Cluster — gecombineerde LSI-index
# -----------------------------------------------------

def _aggregate_hop_cluster(db: Session, fase_label: str, Model) -> Dict[str, Any]:
    rows = (
        db.query(Model, Blessure)
        .join(Blessure, Model.blessure_id == Blessure.blessure_id)
        .all()
    )

    lsi_values = {"cmj_hoogte": [], "single_hop_distance": [], "sidehop": []}

    for rec, bl in rows:
        oper_side, gez_side = _oper_gezond_sides(bl.zijde)
        if not oper_side:
            continue

        def _lsi(field):
            op = _safe(getattr(rec, f"{field}_{oper_side}", None))
            gz = _safe(getattr(rec, f"{field}_{gez_side}", None))
            if op and gz:
                return (op / gz) * 100
            return None

        cmj = _lsi("cmj_hoogte")
        hop = _lsi("single_hop_distance")
        side = _lsi("sidehop")

        if cmj: lsi_values["cmj_hoogte"].append(cmj)
        if hop: lsi_values["single_hop_distance"].append(hop)
        if side: lsi_values["sidehop"].append(side)

    subtests = {k: _avg(v, 1) for k, v in lsi_values.items()}
    all_vals = [v for arr in lsi_values.values() for v in arr]
    return {
        "fase": fase_label,
        "hop_cluster": {
            "mean_lsi": _avg(all_vals, 1),
            "n": len(all_vals),
            "subtests": subtests
        }
    }


# -----------------------------------------------------
# Hoofdroutine per fase
# -----------------------------------------------------

@router.get("/group")
def get_group_functioneel(db: Session = Depends(get_db)):
    """
    Retourneert per fase:
      - Baseline: Lag & VMO (%)
      - Functionele testen (Stepdown, Squat, Hop)
      - Springtesten (CMJ, Drop Jump)
      - Hop Test Cluster (Maand 6)
    """
    out = {"baseline": None, "fases": []}

    # ✅ Baseline
    out["baseline"] = _aggregate_baseline_categorical(db)

    # ✅ Andere fases
    for fase_label, Model in FASES:
        if fase_label == "Baseline":
            continue

        fase_data = {"fase": fase_label, "functioneel": [], "spring": [], "hop_cluster": None}

        # --- Functionele testen ---
        fase_func = _aggregate_unilateral_tests(db, fase_label, Model, FUNCTIONELE_TESTEN)
        fase_data["functioneel"] = fase_func["testen"]

        # --- CMJ + Drop Jump ---
        cmj_unilat = [t for t in CMJ_TESTEN if "_2benig" not in t[1]]
        cmj_bilat = [t for t in CMJ_TESTEN if "_2benig" in t[1]]
        dj_unilat = [t for t in DROPJUMP_TESTEN if "_2benig" not in t[1]]
        dj_bilat = [t for t in DROPJUMP_TESTEN if "_2benig" in t[1]]

        spring_unilat = _aggregate_unilateral_tests(db, fase_label, Model, cmj_unilat + dj_unilat)
        spring_bilat = _aggregate_bilateral_tests(db, fase_label, Model, cmj_bilat + dj_bilat)
        fase_data["spring"] = spring_unilat["testen"] + spring_bilat["testen"]

        # --- Hop Cluster ---
        if fase_label == "Maand 6":
            fase_data["hop_cluster"] = _aggregate_hop_cluster(db, fase_label, Model)["hop_cluster"]

        out["fases"].append(fase_data)

    return out
