# =====================================================
# FILE: routers/baseline.py
# Revo Sport API — Baseline testing (Upsert versie)
# =====================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.baseline import Baseline
from models.blessure import Blessure
from schemas.baseline import BaselineSchema
from routers.utils import ok, warn

router = APIRouter(prefix="/baseline", tags=["Baseline"])


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
# 🔹 GET — Alle baseline records
# =====================================================
@router.get("/", response_model=List[BaselineSchema])
def list_baseline(db: Session = Depends(get_db)):
    items = db.query(Baseline).all()
    ok(f"[BASELINE] {len(items)} records opgehaald")
    return items


# =====================================================
# 🔹 GET — 1 baseline op blessure_id
# =====================================================
@router.get("/{blessure_id}", response_model=BaselineSchema)
def get_baseline(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Baseline niet gevonden")
    ok(f"[BASELINE] Record opgehaald (blessure_id={blessure_id})")
    return obj


# =====================================================
# 🔹 POST — Upsert logica
# =====================================================
@router.post("/", response_model=BaselineSchema)
def upsert_baseline(data: BaselineSchema, db: Session = Depends(get_db)):
    """
    Maakt een nieuw baseline-record aan als het nog niet bestaat.
    Bestaat er al een record voor deze blessure? → dan wordt het geüpdatet.
    """
    # ✅ Controleer gekoppelde blessure
    blessure = db.query(Blessure).filter(Blessure.blessure_id == data.blessure_id).first()
    if not blessure:
        warn(f"[BASELINE] Geen gekoppelde blessure gevonden (id={data.blessure_id})")
        raise HTTPException(status_code=404, detail="Gekoppelde blessure niet gevonden")

    # ✅ Zoek bestaand record
    obj = db.query(Baseline).filter(Baseline.blessure_id == data.blessure_id).first()

    try:
        if obj:
            # 🟠 UPDATE
            for k, v in data.dict(exclude_unset=True).items():
                setattr(obj, k, v)
            db.commit(); db.refresh(obj)
            ok(f"[BASELINE] Record geüpdatet (blessure_id={obj.blessure_id})")
            return obj

        else:
            # 🟢 INSERT
            obj = Baseline(**data.dict(exclude_unset=True))
            db.add(obj)
            db.commit(); db.refresh(obj)
            ok(f"[BASELINE] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
            return obj

    except Exception as e:
        db.rollback()
        warn(f"[BASELINE] Fout bij upsert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 DELETE — Verwijder Baseline
# =====================================================
@router.delete("/{blessure_id}")
def delete_baseline(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Baseline niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[BASELINE] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Baseline verwijderd"}
