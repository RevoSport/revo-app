# =====================================================
# FILE: routers/week6.py
# Revo Sport API — Week 6 testing (Upsert-versie)
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.week6 import Week6
from models.blessure import Blessure
from schemas.week6 import Week6Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/week6", tags=["Week 6"])


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
# 🔹 GET — Alle records
# =====================================================
@router.get("/", response_model=List[Week6Schema])
def list_week6(db: Session = Depends(get_db)):
    data = db.query(Week6).all()
    ok(f"[WEEK6] {len(data)} records opgehaald")
    return data


# =====================================================
# 🔹 GET — Eén record per blessure_id
# =====================================================
@router.get("/{blessure_id}", response_model=Week6Schema)
def get_week6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Week6).filter(Week6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[WEEK6] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Week6 niet gevonden")
    ok(f"[WEEK6] Record opgehaald (blessure_id={blessure_id})")
    return obj


# =====================================================
# 🔹 POST — Upsert logica
# =====================================================
@router.post("/", response_model=Week6Schema)
def upsert_week6(data: Week6Schema, db: Session = Depends(get_db)):
    """
    Maakt een nieuw week6-record aan als het nog niet bestaat.
    Bestaat er al een record voor deze blessure? → dan wordt het geüpdatet.
    """
    # ✅ Controleer of blessure bestaat
    blessure = db.query(Blessure).filter(Blessure.blessure_id == data.blessure_id).first()
    if not blessure:
        warn(f"[WEEK6] Geen gekoppelde blessure gevonden (id={data.blessure_id})")
        raise HTTPException(404, detail="Gekoppelde blessure niet gevonden")

    # ✅ Zoek bestaand record
    obj = db.query(Week6).filter(Week6.blessure_id == data.blessure_id).first()

    try:
        if obj:
            # 🟠 UPDATE
            for k, v in data.dict(exclude_unset=True).items():
                setattr(obj, k, v)
            db.commit()
            db.refresh(obj)
            ok(f"[WEEK6] Record geüpdatet (blessure_id={obj.blessure_id})")
            return obj
        else:
            # 🟢 INSERT
            obj = Week6(**data.dict(exclude_unset=True))
            db.add(obj)
            db.commit()
            db.refresh(obj)
            ok(f"[WEEK6] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
            return obj

    except Exception as e:
        db.rollback()
        warn(f"[WEEK6] Fout bij upsert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 DELETE — Verwijderen
# =====================================================
@router.delete("/{blessure_id}")
def delete_week6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Week6).filter(Week6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[WEEK6] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Week6 niet gevonden")
    db.delete(obj)
    db.commit()
    ok(f"[WEEK6] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Week6 verwijderd"}
