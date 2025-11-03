# =====================================================
# FILE: routers/maand3.py
# Revo Sport API — Maand 3 testing (Upsert-versie)
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.maand3 import Maand3
from models.blessure import Blessure
from schemas.maand3 import Maand3Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/maand3", tags=["Maand 3"])


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
@router.get("/", response_model=List[Maand3Schema])
def list_maand3(db: Session = Depends(get_db)):
    data = db.query(Maand3).all()
    ok(f"[MAAND3] {len(data)} records opgehaald")
    return data


# =====================================================
# 🔹 GET — Eén record per blessure_id (altijd alle velden)
# =====================================================
@router.get("/{blessure_id}")
def get_maand3(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand3).filter(Maand3.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND3] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand3 niet gevonden")

    ok(f"[MAAND3] Record opgehaald (blessure_id={blessure_id})")

    # ✅ Forceer alle kolommen, met lege strings i.p.v. None
    data_dict = {
        c.name: getattr(obj, c.name) if getattr(obj, c.name) is not None else ""
        for c in obj.__table__.columns
    }
    return data_dict



# =====================================================
# 🔹 POST — Upsert logica
# =====================================================
@router.post("/", response_model=Maand3Schema)
def upsert_maand3(data: Maand3Schema, db: Session = Depends(get_db)):
    """
    Maakt een nieuw maand3-record aan als het nog niet bestaat.
    Bestaat er al een record voor deze blessure? → dan wordt het geüpdatet.
    """
    blessure = db.query(Blessure).filter(Blessure.blessure_id == data.blessure_id).first()
    if not blessure:
        warn(f"[MAAND3] Geen gekoppelde blessure gevonden (id={data.blessure_id})")
        raise HTTPException(404, detail="Gekoppelde blessure niet gevonden")

    obj = db.query(Maand3).filter(Maand3.blessure_id == data.blessure_id).first()

    try:
        if obj:
            # 🟠 UPDATE
            for k, v in data.dict(exclude_unset=True).items():
                setattr(obj, k, v)
            db.commit()
            db.refresh(obj)
            ok(f"[MAAND3] Record geüpdatet (blessure_id={obj.blessure_id})")
            return obj
        else:
            # 🟢 INSERT
            obj = Maand3(**data.dict(exclude_unset=True))
            db.add(obj)
            db.commit()
            db.refresh(obj)
            ok(f"[MAAND3] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
            return obj

    except Exception as e:
        db.rollback()
        warn(f"[MAAND3] Fout bij upsert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 DELETE — Verwijderen
# =====================================================
@router.delete("/{blessure_id}")
def delete_maand3(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand3).filter(Maand3.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND3] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand3 niet gevonden")
    db.delete(obj)
    db.commit()
    ok(f"[MAAND3] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Maand3 verwijderd"}
