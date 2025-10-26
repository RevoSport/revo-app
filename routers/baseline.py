# =====================================================
# FILE: routers/baseline.py
# Revo Sport API — Baseline testing (mobiliteit, omtrek, functionele observaties)
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
# 🔹 GET /baseline — Alle baseline records
# =====================================================
@router.get("/", response_model=List[BaselineSchema])
def list_baseline(db: Session = Depends(get_db)):
    """
    Haalt alle baseline records op.
    """
    items = db.query(Baseline).all()
    ok(f"[BASELINE] {len(items)} records opgehaald")
    return items


# =====================================================
# 🔹 GET /baseline/{blessure_id} — 1 baseline op blessure_id
# =====================================================
@router.get("/{blessure_id}", response_model=BaselineSchema)
def get_baseline(blessure_id: int, db: Session = Depends(get_db)):
    """
    Haalt het baseline-record op dat hoort bij een blessure.
    """
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Baseline niet gevonden")

    ok(f"[BASELINE] Record opgehaald (blessure_id={blessure_id})")
    return obj


# =====================================================
# 🔹 POST /baseline — Nieuw baseline-record aanmaken
# =====================================================
@router.post("/", response_model=BaselineSchema)
def create_baseline(data: BaselineSchema, db: Session = Depends(get_db)):
    """
    Maakt een nieuw baseline-record aan. Vereist een bestaand blessure_id.
    """
    try:
        # ✅ Controleer blessure
        blessure = db.query(Blessure).filter(Blessure.blessure_id == data.blessure_id).first()
        if not blessure:
            raise HTTPException(status_code=404, detail="Gekoppelde blessure niet gevonden")

        # ✅ Object maken
        obj = Baseline(**data.dict(exclude_unset=True))
        db.add(obj)
        db.commit()
        db.refresh(obj)

        ok(f"[BASELINE] Nieuw record aangemaakt (baseline_id={obj.id if hasattr(obj,'id') else '?'} | blessure_id={obj.blessure_id})")
        return obj

    except Exception as e:
        db.rollback()
        warn(f"[BASELINE] Fout bij aanmaken baseline: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 PUT /baseline/{blessure_id} — Baseline bijwerken
# =====================================================
@router.put("/{blessure_id}", response_model=BaselineSchema)
def update_baseline(blessure_id: int, data: BaselineSchema, db: Session = Depends(get_db)):
    """
    Wijzigt een bestaand baseline-record.
    """
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Baseline niet gevonden")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)

    db.commit()
    db.refresh(obj)
    ok(f"[BASELINE] Record geüpdatet (blessure_id={blessure_id})")
    return obj


# =====================================================
# 🔹 DELETE /baseline/{blessure_id} — Verwijderen
# =====================================================
@router.delete("/{blessure_id}")
def delete_baseline(blessure_id: int, db: Session = Depends(get_db)):
    """
    Verwijdert een baseline op basis van blessure_id.
    """
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(status_code=404, detail="Baseline niet gevonden")

    db.delete(obj)
    db.commit()

    ok(f"[BASELINE] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Baseline verwijderd"}
