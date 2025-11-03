# =====================================================
# FILE: routers/maand6.py
# Revo Sport API — Maand 6 testing (Upsert-versie)
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.maand6 import Maand6
from models.blessure import Blessure
from schemas.maand6 import Maand6Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/maand6", tags=["Maand 6"])


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
@router.get("/", response_model=List[Maand6Schema])
def list_maand6(db: Session = Depends(get_db)):
    data = db.query(Maand6).all()
    ok(f"[MAAND6] {len(data)} records opgehaald")
    return data


# =====================================================
# 🔹 GET — Eén record per blessure_id (altijd volledige dict)
# =====================================================
@router.get("/{blessure_id}")
def get_maand6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand6).filter(Maand6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND6] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand6 niet gevonden")

    ok(f"[MAAND6] Record opgehaald (blessure_id={blessure_id})")

    # ✅ Converteer naar dict met lege strings voor None-waarden
    data_dict = {
        c.name: getattr(obj, c.name) if getattr(obj, c.name) is not None else ""
        for c in obj.__table__.columns
    }
    return data_dict


# =====================================================
# 🔹 POST — Upsert logica
# =====================================================
@router.post("/", response_model=Maand6Schema)
def upsert_maand6(data: Maand6Schema, db: Session = Depends(get_db)):
    """
    Maakt een nieuw maand6-record aan als het nog niet bestaat.
    Bestaat er al een record voor deze blessure? → dan wordt het geüpdatet.
    """
    blessure = db.query(Blessure).filter(Blessure.blessure_id == data.blessure_id).first()
    if not blessure:
        warn(f"[MAAND6] Geen gekoppelde blessure gevonden (id={data.blessure_id})")
        raise HTTPException(404, detail="Gekoppelde blessure niet gevonden")

    obj = db.query(Maand6).filter(Maand6.blessure_id == data.blessure_id).first()

    try:
        if obj:
            # 🟠 UPDATE
            for k, v in data.dict(exclude_unset=True).items():
                setattr(obj, k, v)
            db.commit()
            db.refresh(obj)
            ok(f"[MAAND6] Record geüpdatet (blessure_id={obj.blessure_id})")
            return obj
        else:
            # 🟢 INSERT
            obj = Maand6(**data.dict(exclude_unset=True))
            db.add(obj)
            db.commit()
            db.refresh(obj)
            ok(f"[MAAND6] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
            return obj

    except Exception as e:
        db.rollback()
        warn(f"[MAAND6] Fout bij upsert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 DELETE — Verwijderen
# =====================================================
@router.delete("/{blessure_id}")
def delete_maand6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand6).filter(Maand6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND6] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand6 niet gevonden")
    db.delete(obj)
    db.commit()
    ok(f"[MAAND6] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Maand6 verwijderd"}
