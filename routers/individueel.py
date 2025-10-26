# =====================================================
# FILE: routers/individueel.py
# Revo Sport API — Volledige Individuele Analyse per Patiënt (altijd volledige tijdlijn)
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Tuple, Optional
from datetime import date
from db import get_db
import statistics

# Models
from models.patient import Patient
from models.blessure import Blessure
from models.baseline import Baseline
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6

router = APIRouter(prefix="/individueel", tags=["Individueel"])

# =====================================================
# 🔹 Helpers
# =====================================================

def _safe(val):
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
    if zijde == "Links":
        return "l", "r"
    if zijde == "Rechts":
        return "r", "l"
    return None, None

def _perc_diff(op: Optional[float], gz: Optional[float]):
    if op and gz and gz != 0:
        return round(((op - gz) / gz) * 100, 1)
    return None

def _ratio(a: Optional[float], b: Optional[float]):
    if a and b and b != 0:
        return round(a / b, 2)
    return None

def _model_heeft_krachtveld(Model, base: str) -> bool:
    return hasattr(Model, f"kracht_{base}_l") or hasattr(Model, f"kracht_{base}_r")

# =====================================================
# 🔹 Configuratie
# =====================================================

FASES = [
    ("Baseline", Baseline),
    ("Week 6", Week6),
    ("Maand 3", Maand3),
    ("Maand 4.5", Maand45),
    ("Maand 6", Maand6),
]

KRACHT_FIELDS = [
    ("Quadriceps 60", "quadriceps_60"),
    ("Hamstrings 30", "hamstrings_30"),
    ("Hamstrings 90/90", "hamstrings_90_90"),
    ("Soleus", "soleus"),
    ("Abductoren kort", "abductoren_kort"),
    ("Abductoren lang", "abductoren_lang"),
    ("Adductoren kort", "adductoren_kort"),
    ("Adductoren lang", "adductoren_lang"),
    ("Exorotatoren heup", "exorotatoren_heup"),
    ("Nordics", "nordics"),
]

RATIO_FIELDS = [
    ("H/Q", "hamstrings_30", "quadriceps_60"),
    ("ADD/ABD Kort", "adductoren_kort", "abductoren_kort"),
    ("ADD/ABD Lang", "adductoren_lang", "abductoren_lang"),
]

FUNCTIONELE_TESTEN = [
    ("Step Down – Valgus Score", "stepdown_valgus_score"),
    ("Step Down – Pelvis Controle", "stepdown_pelvische_controle"),
    ("Squat Forceplate", "squat_forceplate"),
    ("Single Hop Distance", "single_hop_distance"),
    ("Side Hop", "sidehop"),
]

SPRING_TESTEN_UNILAT = [
    ("CMJ 1-been Hoogte", "cmj_hoogte"),
    ("Drop Jump 1-been Hoogte", "dropjump_hoogte"),
    ("Drop Jump 1-been RSI", "dropjump_rsi"),
]
SPRING_TESTEN_BILAT = [
    ("CMJ 2-been Hoogte", "cmj_hoogte_2benig"),
    ("Drop Jump 2-been Hoogte", "dropjump_hoogte_2benig"),
]

# =====================================================
# 🔹 GET /individueel/{id}/metrics
# =====================================================
@router.get("/{id}/metrics")
def get_individueel_metrics(id: int, db: Session = Depends(get_db)):
    blessure = db.query(Blessure).filter(Blessure.blessure_id == id).first()
    if blessure:
        patient_id = blessure.patient_id
    else:
        patient_id = id

    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    blessure = db.query(Blessure).filter(Blessure.patient_id == patient_id).first()
    if not blessure:
        return {"error": "Geen blessure gekoppeld aan patiënt."}

    zijde = blessure.zijde or "Rechts"
    oper_side, gezond_side = _oper_gezond_sides(zijde)
    out = {"fases": []}

    # -------------------------------------------------
    # Loop over alle fases (altijd tonen)
    # -------------------------------------------------
    for fase_label, Model in FASES:
        rec = db.query(Model).filter(Model.blessure_id == blessure.blessure_id).first()
        fase_info = {"fase": fase_label}

        # -------------------------------------------------
        # ANTROPOMETRIE
        # -------------------------------------------------
        if rec:
            def _get(attr_l, attr_r):
                return getattr(rec, attr_l, None), getattr(rec, attr_r, None)
            om5_op, om5_gz = _get(f"omtrek_5cm_boven_patella_{oper_side}", f"omtrek_5cm_boven_patella_{gezond_side}")
            om10_op, om10_gz = _get(f"omtrek_10cm_boven_patella_{oper_side}", f"omtrek_10cm_boven_patella_{gezond_side}")
            om20_op, om20_gz = _get(f"omtrek_20cm_boven_patella_{oper_side}", f"omtrek_20cm_boven_patella_{gezond_side}")
        else:
            om5_op = om5_gz = om10_op = om10_gz = om20_op = om20_gz = None

        fase_info["antropometrie"] = {
            "cm5_oper": om5_op,
            "cm5_gez": om5_gz,
            "cm10_oper": om10_op,
            "cm10_gez": om10_gz,
            "cm20_oper": om20_op,
            "cm20_gez": om20_gz,
            "diff5": _perc_diff(om5_op, om5_gz),
            "diff10": _perc_diff(om10_op, om10_gz),
            "diff20": _perc_diff(om20_op, om20_gz),
        }

        # -------------------------------------------------
        # MOBILITEIT
        # -------------------------------------------------
        if rec:
            if fase_label == "Baseline":
                mobiliteit = {
                    "flexie_oper": getattr(rec, f"knie_flexie_{oper_side}", None),
                    "flexie_gezond": getattr(rec, f"knie_flexie_{gezond_side}", None),
                    "extensie_oper": getattr(rec, f"knie_extensie_{oper_side}", None),
                    "extensie_gezond": getattr(rec, f"knie_extensie_{gezond_side}", None),
                }
            else:
                mobiliteit = {
                    "flexie_oper": getattr(rec, "knie_flexie", None),
                    "extensie_oper": getattr(rec, "knie_extensie", None),
                    "flexie_gezond": None,
                    "extensie_gezond": None,
                }
        else:
            mobiliteit = {
                "flexie_oper": None,
                "extensie_oper": None,
                "flexie_gezond": None,
                "extensie_gezond": None,
            }
        fase_info["mobiliteit"] = mobiliteit

        # -------------------------------------------------
        # KRACHT (alle fases die velden hebben)
        # -------------------------------------------------
        kracht_out = []
        kracht_beschikbaar = False
        heeft_kracht_in_model = any(_model_heeft_krachtveld(Model, base) for _, base in KRACHT_FIELDS)

        if heeft_kracht_in_model:
            for label, base in KRACHT_FIELDS:
                if not _model_heeft_krachtveld(Model, base):
                    continue
                op = _safe(getattr(rec, f"kracht_{base}_{oper_side}", None)) if rec else None
                gz = _safe(getattr(rec, f"kracht_{base}_{gezond_side}", None)) if rec else None
                if op is not None or gz is not None:
                    kracht_beschikbaar = True
                kracht_out.append({
                    "spiergroep": label,
                    "geopereerd": op,
                    "gezond": gz,
                    "verschil_pct": _perc_diff(op, gz),
                })
        fase_info["kracht"] = kracht_out
        fase_info["has_kracht"] = bool(kracht_out)

        # -------------------------------------------------
        # RATIO’S (alleen als model krachtvelden heeft)
        # -------------------------------------------------
        ratio_out = []
        if heeft_kracht_in_model:
            for label, num, denom in RATIO_FIELDS:
                if not (_model_heeft_krachtveld(Model, num) and _model_heeft_krachtveld(Model, denom)):
                    continue
                if rec:
                    r_op = _ratio(
                        _safe(getattr(rec, f"kracht_{num}_{oper_side}", None)),
                        _safe(getattr(rec, f"kracht_{denom}_{oper_side}", None)),
                    )
                    r_gz = _ratio(
                        _safe(getattr(rec, f"kracht_{num}_{gezond_side}", None)),
                        _safe(getattr(rec, f"kracht_{denom}_{gezond_side}", None)),
                    )
                else:
                    r_op = r_gz = None
                ratio_out.append({
                    "ratio": label,
                    "geopereerd": r_op,
                    "gezond": r_gz,
                    "verschil_pct": _perc_diff(r_op, r_gz),
                })
        fase_info["ratios"] = ratio_out

        # -------------------------------------------------
        # FUNCTIONELE TESTEN (altijd zichtbaar)
        # -------------------------------------------------
        func_out = []
        for label, base in FUNCTIONELE_TESTEN:
            op = _safe(getattr(rec, f"{base}_{oper_side}", None)) if rec else None
            gz = _safe(getattr(rec, f"{base}_{gezond_side}", None)) if rec else None
            func_out.append({
                "test": label,
                "geopereerd": op,
                "gezond": gz,
                "verschil_pct": _perc_diff(op, gz),
            })
        fase_info["functioneel"] = func_out

        # -------------------------------------------------
        # SPRINGTESTEN
        # -------------------------------------------------
        spring_out = []
        for label, base in SPRING_TESTEN_UNILAT:
            op = _safe(getattr(rec, f"{base}_{oper_side}", None)) if rec else None
            gz = _safe(getattr(rec, f"{base}_{gezond_side}", None)) if rec else None
            spring_out.append({
                "test": label,
                "geopereerd": op,
                "gezond": gz,
                "verschil_pct": _perc_diff(op, gz),
            })
        for label, base in SPRING_TESTEN_BILAT:
            val = _safe(getattr(rec, base, None)) if rec else None
            spring_out.append({"test": label, "gemiddelde": val})
        fase_info["spring"] = spring_out

        # -------------------------------------------------
        # HOP CLUSTER
        # -------------------------------------------------
        hop_lsi = []
        for field in ["cmj_hoogte", "single_hop_distance", "sidehop"]:
            op = _safe(getattr(rec, f"{field}_{oper_side}", None)) if rec else None
            gz = _safe(getattr(rec, f"{field}_{gezond_side}", None)) if rec else None
            hop_lsi.append(_ratio(op, gz))
        fase_info["hop_cluster"] = {
            "mean_lsi": _avg(hop_lsi, 1),
            "subtests": {
                "CMJ": hop_lsi[0],
                "Single Hop": hop_lsi[1],
                "Side Hop": hop_lsi[2],
            },
        }

        out["fases"].append(fase_info)

    return out

# =====================================================
# 🔹 GET /individueel/{blessure_id}/summary
# =====================================================
FASES_MAP = dict(FASES)

def _calc_leeftijd(geboortedatum: date):
    if not geboortedatum:
        return None
    today = date.today()
    return (
        today.year
        - geboortedatum.year
        - ((today.month, today.day) < (geboortedatum.month, geboortedatum.day))
    )

@router.get("/{blessure_id}/summary")
def get_individueel_summary(blessure_id: int, db: Session = Depends(get_db)):
    blessure = (
        db.query(Blessure)
        .options(joinedload(Blessure.patient))
        .filter(Blessure.blessure_id == blessure_id)
        .first()
    )
    if not blessure:
        raise HTTPException(status_code=404, detail="Blessure niet gevonden")

    patient = blessure.patient
    aantal_blessures = (
        db.query(Blessure).filter(Blessure.patient_id == blessure.patient_id).count()
    )

    fases_aanwezig = []
    laatste_datum = None

    for naam, model in FASES_MAP.items():
        record = db.query(model).filter(model.blessure_id == blessure.blessure_id).first()
        if record:
            fases_aanwezig.append(naam)
            if hasattr(record, "datum_onderzoek") and record.datum_onderzoek:
                if not laatste_datum or record.datum_onderzoek > laatste_datum:
                    laatste_datum = record.datum_onderzoek

    laatste_fase = fases_aanwezig[-1] if fases_aanwezig else None
    if laatste_fase == "Maand 6":
        status = "Revalidatie afgerond"
    elif laatste_fase:
        status = "Actieve revalidatie"
    else:
        status = "Nog niet gestart"

    return {
        "patient_id": patient.patient_id,
        "blessure_id": blessure.blessure_id,
        "naam": getattr(patient, "naam", None),
        "geslacht": getattr(patient, "geslacht", None),
        "geboortedatum": getattr(patient, "geboortedatum", None),
        "leeftijd": _calc_leeftijd(getattr(patient, "geboortedatum", None)),
        "zijde": getattr(blessure, "zijde", None),
        "operatie": getattr(blessure, "operatie", None),
        "datum_operatie": getattr(blessure, "datum_operatie", None),
        "sport": getattr(blessure, "sport", None),
        "sportniveau": getattr(blessure, "sportniveau", None),
        "aantal_blessures": aantal_blessures,
        "aantal_fases": len(fases_aanwezig),
        "laatste_fase": laatste_fase,
        "laatste_testdatum": laatste_datum,
        "status": status,
    }
