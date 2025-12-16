# =====================================================
# FILE: routers/blessure.py
# Revo Sport API — Blessures + gekoppelde patiëntinfo
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from db import SessionLocal
from models.blessure import Blessure
from models.patient import Patient
from schemas.blessure import BlessureSchema, BlessureUpdateSchema
from routers.utils import ok, warn
from sqlalchemy import text

router = APIRouter(prefix="/blessure", tags=["Blessures"])


# =====================================================
# 🔹 DB dependency
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =====================================================
# 🔹 Helpers
# =====================================================
def normalize_text(value):
    if value is None:
        return None
    value = value.strip()
    return value if value != "" else None

def value_exists(db: Session, field: str, value: str, exclude_id: int | None = None):
    if value is None:
        return False

    sql = f"""
        SELECT 1
        FROM blessures
        WHERE LOWER(TRIM({field})) = LOWER(:value)
    """
    params = {"value": value}

    if exclude_id is not None:
        sql += " AND blessure_id <> :exclude_id"
        params["exclude_id"] = exclude_id

    result = db.execute(text(sql), params).first()
    return result is not None


# =====================================================
# 🔹 GET /blessure/options — Alle enumopties
# =====================================================
@router.get("/options")
def get_blessure_options():
    """
    Retourneert alle mogelijke enum-opties voor blessurevelden.
    Wordt gebruikt voor dynamische dropdowns in het formulier.
    """
    options = {
        "zijde": ["Links", "Rechts"],
        "etiologie": ["Contact", "Non-contact"],
        "operatie": [
            "Hamstring pees",
            "Quadriceps pees",
            "Donorpees",
            "Patellapees",
            "Niet gekend",
        ],
        "sportniveau": [
            "Sedentair",
            "Recreatief",
            "Competitief",
            "Topsport",
            "Niet Van Toepassing",
        ],
        "bijkomende_letsels": [
            "Meniscushechting",
            "Meniscus dissectie",
            "Mediale band",
            "Kraakbeen revise",
            "Nvt",
        ],
    }

    ok("[BLESSURE] Enum-opties opgevraagd voor formulier")
    return options

# =====================================================
# 🔹 GET /blessure/therapeuten — Dynamische therapeutenlijst
# =====================================================


@router.get("/therapeuten")
def list_therapeuten(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
        SELECT DISTINCT TRIM(therapeut) AS therapeut
        FROM blessures
        WHERE therapeut IS NOT NULL AND TRIM(therapeut) <> ''
        ORDER BY therapeut
        """)
    ).fetchall()

    result = [r[0] for r in rows]
    ok(f"[BLESSURE] {len(result)} therapeuten opgehaald")
    return result

# =====================================================
# 🔹 GET /blessure/sporten — Dynamische sportenlijst
# =====================================================
@router.get("/sporten")
def list_sporten(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
        SELECT DISTINCT TRIM(sport) AS sport
        FROM blessures
        WHERE sport IS NOT NULL AND TRIM(sport) <> ''
        ORDER BY sport
        """)
    ).fetchall()

    result = [r[0] for r in rows]
    ok(f"[BLESSURE] {len(result)} sporten opgehaald")
    return result

# =====================================================
# 🔹 GET /blessure/artsen — Dynamische artsenlijst
# =====================================================

@router.get("/artsen")
def list_artsen(db: Session = Depends(get_db)):
    rows = db.execute(
        text("""
        SELECT DISTINCT TRIM(arts) AS arts
        FROM blessures
        WHERE arts IS NOT NULL AND TRIM(arts) <> ''
        ORDER BY arts
        """)
    ).fetchall()

    result = [r[0] for r in rows]
    ok(f"[BLESSURE] {len(result)} artsen opgehaald")
    return result


# =====================================================
# 🔹 GET /blessure — Alle blessures + gekoppelde patiëntinfo
# =====================================================
@router.get("/")
def list_blessures(db: Session = Depends(get_db)):
    """
    Retourneert alle blessures met gekoppelde patiëntinfo.
    Wordt gebruikt in dropdowns of individuele dashboards.
    """
    blessures = (
        db.query(Blessure)
        .options(joinedload(Blessure.patient))
        .all()
    )

    result = []
    for b in blessures:
        p = b.patient
        result.append({
            "blessure_id": b.blessure_id,
            "patient_id": b.patient_id,
            "naam": getattr(p, "naam", None) or f"Patiënt #{b.patient_id}",
            "geslacht": getattr(p, "geslacht", None),
            "geboortedatum": getattr(p, "geboortedatum", None),
            "zijde": getattr(b, "zijde", None),
            "operatie": getattr(b, "operatie", None),
            "datum_operatie": getattr(b, "datum_operatie", None),
            "sport": getattr(b, "sport", None),
            "sportniveau": getattr(b, "sportniveau", None),
        })

    ok(f"[BLESSURE] {len(result)} records opgehaald (met patiëntinfo)")
    return result


# =====================================================
# 🔹 GET /blessure/{id} — Specifieke blessure
# =====================================================
@router.get("/{blessure_id}", response_model=BlessureSchema)
def get_blessure(blessure_id: int, db: Session = Depends(get_db)):
    obj = (
        db.query(Blessure)
        .options(joinedload(Blessure.patient))
        .filter(Blessure.blessure_id == blessure_id)
        .first()
    )
    if not obj:
        warn(f"[BLESSURE] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Blessure niet gevonden")

    ok(f"[BLESSURE] Record opgehaald (blessure_id={blessure_id})")
    return obj


# =====================================================
# 🔹 POST /blessure — Nieuwe blessure aanmaken
# =====================================================
@router.post("/", response_model=BlessureSchema)
def create_blessure(data: BlessureSchema, db: Session = Depends(get_db)):
    """
    Voegt een nieuwe blessure toe. Vereist een geldig patient_id.
    """
    try:
        if not data.patient_id:
            raise HTTPException(status_code=400, detail="patient_id is verplicht")

        patient = db.query(Patient).filter(Patient.patient_id == data.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

        data_dict = data.dict(exclude_unset=True)

        for field in ("arts", "therapeut", "sport"):
            if field in data_dict:
                data_dict[field] = normalize_text(data_dict[field])

        for field in ("arts", "therapeut", "sport"):
            val = data_dict.get(field)
            if val and value_exists(db, field, val):
                raise HTTPException(
                    status_code=409,
                    detail=f"{field.capitalize()} bestaat al"
                )


        obj = Blessure(**data_dict)

        db.add(obj)
        db.commit()
        db.refresh(obj)

        ok(f"[BLESSURE] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
        return obj

    except Exception as e:
        db.rollback()
        warn(f"[BLESSURE] Fout bij aanmaken blessure: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 PUT /blessure/{id} — Blessure bijwerken
# =====================================================
@router.put("/{blessure_id}", response_model=BlessureSchema)
def update_blessure(blessure_id: int, data: BlessureUpdateSchema, db: Session = Depends(get_db)):
    obj = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BLESSURE] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Blessure niet gevonden")

    for k, v in data.dict(exclude_unset=True).items():
        if k in ("arts", "therapeut", "sport"):
            v = normalize_text(v)
            if v and value_exists(db, k, v, exclude_id=blessure_id):
                raise HTTPException(
                    status_code=409,
                    detail=f"{k.capitalize()} bestaat al"
                )
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    ok(f"[BLESSURE] Record geüpdatet (blessure_id={blessure_id})")
    return obj


# =====================================================
# 🔹 DELETE /blessure/{id} — Blessure verwijderen
# =====================================================
@router.delete("/{blessure_id}")
def delete_blessure(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BLESSURE] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Blessure niet gevonden")

    db.delete(obj)
    db.commit()

    ok(f"[BLESSURE] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Blessure verwijderd"}
