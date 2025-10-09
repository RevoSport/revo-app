from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.baseline import Baseline
from schemas.baseline import BaselineSchema
from routers.utils import ok, warn

router = APIRouter(prefix="/baseline", tags=["Baseline"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[BaselineSchema])
def list_baseline(db: Session = Depends(get_db)):
    items = db.query(Baseline).all()
    ok(f"[BASELINE] {len(items)} records opgehaald")
    return items

@router.get("/{blessure_id}", response_model=BaselineSchema)
def get_baseline(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Baseline niet gevonden")
    ok(f"[BASELINE] Record opgehaald (blessure_id={blessure_id})")
    return obj

@router.post("/", response_model=BaselineSchema)
def create_baseline(data: BaselineSchema, db: Session = Depends(get_db)):
    obj = Baseline(**data.dict())
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[BASELINE] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj

@router.put("/{blessure_id}", response_model=BaselineSchema)
def update_baseline(blessure_id: int, data: BaselineSchema, db: Session = Depends(get_db)):
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(404, "Baseline niet gevonden")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[BASELINE] Record geüpdatet (blessure_id={blessure_id})")
    return obj

@router.delete("/{blessure_id}")
def delete_baseline(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Baseline).filter(Baseline.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BASELINE] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Baseline niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[BASELINE] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Baseline verwijderd"}
