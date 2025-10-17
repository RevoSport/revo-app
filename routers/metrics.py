# =====================================================
# FILE: routers/metrics.py
# Revo Sport — Metrics summary (geopereerde zijde + % verschil)
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
# Helpers
# -----------------------------------------------------
def avg_safe(values):
    vals = [v for v in values if v not in (None, 0)]
    return round(statistics.mean(vals), 1) if vals else None


def perc_diff(operated, healthy):
    """Bereken % verschil tussen geopereerde en niet-geopereerde zijde per patiënt."""
    diffs = []
    for o, h in zip(operated, healthy):
        if o and h and h != 0:
            diffs.append((o - h) / h * 100)
    return avg_safe(diffs)


# -----------------------------------------------------
# Endpoint
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

        # -------------------------------------------------
        # ANTROPOMETRIE — geopereerde zijde + % verschil
        # -------------------------------------------------
        omtrek5_operated, omtrek10_operated, omtrek20_operated = [], [], []
        diff5_vals, diff10_vals, diff20_vals = [], [], []

        for r in rows:
            side = blessure_zijden.get(r.blessure_id)
            if not side:
                continue

            # 🔸 bepaal waarden geopereerde vs gezonde zijde
            if side == "Links":
                op5 = getattr(r, "omtrek_5cm_boven_patella_l", None)
                op10 = getattr(r, "omtrek_10cm_boven_patella_l", None)
                op20 = getattr(r, "omtrek_20cm_boven_patella_l", None)
                he5 = getattr(r, "omtrek_5cm_boven_patella_r", None)
                he10 = getattr(r, "omtrek_10cm_boven_patella_r", None)
                he20 = getattr(r, "omtrek_20cm_boven_patella_r", None)
            else:
                op5 = getattr(r, "omtrek_5cm_boven_patella_r", None)
                op10 = getattr(r, "omtrek_10cm_boven_patella_r", None)
                op20 = getattr(r, "omtrek_20cm_boven_patella_r", None)
                he5 = getattr(r, "omtrek_5cm_boven_patella_l", None)
                he10 = getattr(r, "omtrek_10cm_boven_patella_l", None)
                he20 = getattr(r, "omtrek_20cm_boven_patella_l", None)

            omtrek5_operated.append(op5)
            omtrek10_operated.append(op10)
            omtrek20_operated.append(op20)

            # bereken % verschillen per patiënt
            if op5 and he5 and he5 != 0:
                diff5_vals.append((op5 - he5) / he5 * 100)
            if op10 and he10 and he10 != 0:
                diff10_vals.append((op10 - he10) / he10 * 100)
            if op20 and he20 and he20 != 0:
                diff20_vals.append((op20 - he20) / he20 * 100)

        result["antropometrie"].append({
            "fase": label,
            "cm5": avg_safe(omtrek5_operated),
            "cm10": avg_safe(omtrek10_operated),
            "cm20": avg_safe(omtrek20_operated),
            "diff5": avg_safe(diff5_vals),
            "diff10": avg_safe(diff10_vals),
            "diff20": avg_safe(diff20_vals),
        })

        # -------------------------------------------------
        # MOBILITEIT — enkel geopereerde zijde
        # -------------------------------------------------
        flexies, extensies = [], []

        for r in rows:
            side = blessure_zijden.get(r.blessure_id)
            if not side:
                continue

            if label == "Baseline":
                if side == "Links":
                    flexie = getattr(r, "knie_flexie_l", None)
                    extensie = getattr(r, "knie_extensie_l", None)
                else:
                    flexie = getattr(r, "knie_flexie_r", None)
                    extensie = getattr(r, "knie_extensie_r", None)
            else:
                flexie = getattr(r, "knie_flexie", None)
                extensie = getattr(r, "knie_extensie", None)

            flexies.append(flexie)
            extensies.append(extensie)

        result["mobiliteit"].append({
            "fase": label,
            "flexie": avg_safe(flexies),
            "extensie": avg_safe(extensies),
        })

    return result
