# =====================================================
# FILE: routers/blessure.py
# Revo Sport API — Blessures + gekoppelde patiëntinfo
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
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
# 🔹 GET /blessure — Alle blessures + gekoppelde patiëntinfo
# =====================================================
@router.get("/")
def list_blessures(db: Session = Depends(get_db)):
    """
    Retourneert alle blessures met gekoppelde patiëntinfo.
    Wordt gebruikt voor dropdown in individuele dashboards.
    """
    blessures = (
        db.query(Blessure)
        .options(joinedload(Blessure.patient))  # ✅ laadt patiëntgegevens direct in
        .all()
    )

    result = []
    for b in blessures:
        result.append({
            "blessure_id": b.blessure_id,
            "patient_id": getattr(b, "patient_id", None),
            "type": getattr(b, "type", None),
            "zijde": getattr(b, "zijde", None),
            "operatiedatum": getattr(b, "operatiedatum", None),
            # ✅ patiëntgegevens
            "voornaam": getattr(b.patient, "voornaam", None) if b.patient else None,
            "achternaam": getattr(b.patient, "achternaam", None) if b.patient else None,
            "geslacht": getattr(b.patient, "geslacht", None) if b.patient else None,
            "geboortedatum": getattr(b.patient, "geboortedatum", None) if b.patient else None,
        })

    ok(f"[BLESSURE] {len(result)} blessures met patiëntinfo opgehaald")
    return result


# =====================================================
# 🔹 GET /blessure/{id} — Specifieke blessure
# =====================================================
@router.get("/{blessure_id}", response_model=BlessureSchema)
def get_blessure(blessure_id: int, db: Session = Depends(get_db)):
    """
    Retourneert één blessure op basis van blessure_id.
    Inclusief gekoppelde patiënt (via joinedload).
    """
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
    Maakt een nieuwe blessure aan in de database.
    Vereist een geldig patient_id (ForeignKey).
    """
    obj = Blessure(**data.dict(exclude_unset=True))
    db.add(obj)
    db.commit()
    db.refresh(obj)

    ok(f"[BLESSURE] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj


# =====================================================
# 🔹 PUT /blessure/{id} — Blessure bijwerken
# =====================================================
@router.put("/{blessure_id}", response_model=BlessureSchema)
def update_blessure(blessure_id: int, data: BlessureUpdateSchema, db: Session = Depends(get_db)):
    """
    Wijzigt een bestaande blessure op basis van blessure_id.
    """
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
    """
    Verwijdert een blessure op basis van blessure_id.
    """
    obj = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BLESSURE] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Blessure niet gevonden")

    db.delete(obj)
    db.commit()
    ok(f"[BLESSURE] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Blessure verwijderd"}
