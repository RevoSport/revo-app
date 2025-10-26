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
        "therapeut": [
            "Annelien",
            "Frederic",
            "Jasper",
            "Maité",
            "Pepijn",
            "Robbe",
            "Ruben",
            "Sander",
        ],
        "arts": [
            "Dr. Byn",
            "Dr. Dobbelaere",
            "Dr. De Neve",
            "Dr. Moens",
            "Dr. Schepens",
            "Dr. Van Onsem",
            "Dr. Vansintjan",
        ],
        "sport": [
            "Basketbal",
            "Handbal",
            "Hockey",
            "Korfbal",
            "Rugby",
            "Skiën",
            "Turnen",
            "Voetbal",
            "Volleybal",
            "Ander",
            "Niet Van Toepassing",
        ],
        "sportniveau": [
            "Sedentair",
            "Recreatief",
            "Competitief",
            "Topsport",
            "Niet Van Toepassing",
        ],
    }

    ok("[BLESSURE] Enum-opties opgevraagd voor formulier")
    return options


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

        obj = Blessure(**data.dict(exclude_unset=True))
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
