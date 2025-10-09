from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.week6 import Week6
from schemas.week6 import Week6Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/week6", tags=["Week 6"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Week6Schema])
def list_week6(db: Session = Depends(get_db)):
    items = db.query(Week6).all()
    ok(f"[WEEK6] {len(items)} records opgehaald")
    return items

@router.get("/{blessure_id}", response_model=Week6Schema)
def get_week6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Week6).filter(Week6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[WEEK6] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Week6 niet gevonden")
    ok(f"[WEEK6] Record opgehaald (blessure_id={blessure_id})")
    return obj

@router.post("/", response_model=Week6Schema)
def create_week6(data: Week6Schema, db: Session = Depends(get_db)):
    obj = Week6(**data.dict())
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[WEEK6] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj

@router.put("/{blessure_id}", response_model=Week6Schema)
def update_week6(blessure_id: int, data: Week6Schema, db: Session = Depends(get_db)):
    obj = db.query(Week6).filter(Week6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[WEEK6] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(404, "Week6 niet gevonden")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[WEEK6] Record geüpdatet (blessure_id={blessure_id})")
    return obj

@router.delete("/{blessure_id}")
def delete_week6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Week6).filter(Week6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[WEEK6] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Week6 niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[WEEK6] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Week6 verwijderd"}
