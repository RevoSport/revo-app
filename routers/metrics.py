# =====================================================
# FILE: routers/metrics.py
# Revo Sport — Metrics summary met %-verschillen
# =====================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from models.baseline import Baseline
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6
from models.blessure import Blessure
import statistics

router = APIRouter(prefix="/metrics", tags=["Metrics"])

# -----------------------------------------------------
# Hulpfuncties
# -----------------------------------------------------
def avg_safe(values):
    vals = [v for v in values if v not in (None, 0)]
    return round(statistics.mean(vals), 1) if vals else None


def perc_diff(left, right, side):
    """Bereken %-verschil tussen geopereerde en niet-geopereerde zijde."""
    diffs = []
    for l, r in zip(left, right):
        if l and r and l != 0 and r != 0:
            if side == "Links":
                diffs.append((l - r) / r * 100)
            elif side == "Rechts":
                diffs.append((r - l) / l * 100)
    return round(statistics.mean(diffs), 1) if diffs else None


# -----------------------------------------------------
# Hoofdfunctie
# -----------------------------------------------------
@router.get("/summary")
def get_metrics_summary(db: Session = Depends(get_db)):
    fases = {
        "Baseline": Baseline,
        "Week 6": Week6,
        "Maand 3": Maand3,
        "Maand 4.5": Maand45,
        "Maand 6": Maand6,
    }

    blessure_zijden = {b.blessure_id: b.zijde for b in db.query(Blessure).all()}

    result = {"antropometrie": [], "mobiliteit": []}

    for label, model in fases.items():
        rows = db.query(model).all()

        omtrek5_l = [getattr(r, "omtrek_5cm_boven_patella_l", None) for r in rows]
        omtrek5_r = [getattr(r, "omtrek_5cm_boven_patella_r", None) for r in rows]
        omtrek10_l = [getattr(r, "omtrek_10cm_boven_patella_l", None) for r in rows]
        omtrek10_r = [getattr(r, "omtrek_10cm_boven_patella_r", None) for r in rows]
        omtrek20_l = [getattr(r, "omtrek_20cm_boven_patella_l", None) for r in rows]
        omtrek20_r = [getattr(r, "omtrek_20cm_boven_patella_r", None) for r in rows]

        # --- Gemiddelden ---
        omtrek5 = avg_safe(omtrek5_l + omtrek5_r)
        omtrek10 = avg_safe(omtrek10_l + omtrek10_r)
        omtrek20 = avg_safe(omtrek20_l + omtrek20_r)

        # --- %-verschillen Links/Rechts ---
        verschillen5, verschillen10, verschillen20 = [], [], []

        for r in rows:
            side = blessure_zijden.get(r.blessure_id)
            if not side:
                continue

            def diff(l, r):
                if l and r and r != 0:
                    return (l - r) / r * 100
                return None

            # Kies juiste zijde
            if side == "Links":
                d5 = diff(getattr(r, "omtrek_5cm_boven_patella_l", None),
                          getattr(r, "omtrek_5cm_boven_patella_r", None))
                d10 = diff(getattr(r, "omtrek_10cm_boven_patella_l", None),
                           getattr(r, "omtrek_10cm_boven_patella_r", None))
                d20 = diff(getattr(r, "omtrek_20cm_boven_patella_l", None),
                           getattr(r, "omtrek_20cm_boven_patella_r", None))
            else:
                d5 = diff(getattr(r, "omtrek_5cm_boven_patella_r", None),
                          getattr(r, "omtrek_5cm_boven_patella_l", None))
                d10 = diff(getattr(r, "omtrek_10cm_boven_patella_r", None),
                           getattr(r, "omtrek_10cm_boven_patella_l", None))
                d20 = diff(getattr(r, "omtrek_20cm_boven_patella_r", None),
                           getattr(r, "omtrek_20cm_boven_patella_l", None))

            if d5 is not None:
                verschillen5.append(d5)
            if d10 is not None:
                verschillen10.append(d10)
            if d20 is not None:
                verschillen20.append(d20)

        result["antropometrie"].append({
            "fase": label,
            "cm5": omtrek5,
            "cm10": omtrek10,
            "cm20": omtrek20,
            "diff5": avg_safe(verschillen5),
            "diff10": avg_safe(verschillen10),
            "diff20": avg_safe(verschillen20),
        })

        # --- Mobiliteit ---
        if label == "Baseline":
            flexie = [getattr(r, "knie_flexie_l") or getattr(r, "knie_flexie_r") for r in rows]
            extensie = [getattr(r, "knie_extensie_l") or getattr(r, "knie_extensie_r") for r in rows]
        else:
            flexie = [getattr(r, "knie_flexie", None) for r in rows]
            extensie = [getattr(r, "knie_extensie", None) for r in rows]

        result["mobiliteit"].append({
            "fase": label,
            "flexie": avg_safe(flexie),
            "extensie": avg_safe(extensie),
        })

    return result
