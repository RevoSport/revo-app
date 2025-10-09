from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.maand6 import Maand6
from schemas.maand6 import Maand6Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/maand6", tags=["Maand 6"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Maand6Schema])
def list_maand6(db: Session = Depends(get_db)):
    items = db.query(Maand6).all()
    ok(f"[MAAND6] {len(items)} records opgehaald")
    return items

@router.get("/{blessure_id}", response_model=Maand6Schema)
def get_maand6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand6).filter(Maand6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND6] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand6 niet gevonden")
    ok(f"[MAAND6] Record opgehaald (blessure_id={blessure_id})")
    return obj

@router.post("/", response_model=Maand6Schema)
def create_maand6(data: Maand6Schema, db: Session = Depends(get_db)):
    obj = Maand6(**data.dict())
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[MAAND6] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj

@router.put("/{blessure_id}", response_model=Maand6Schema)
def update_maand6(blessure_id: int, data: Maand6Schema, db: Session = Depends(get_db)):
    obj = db.query(Maand6).filter(Maand6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND6] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand6 niet gevonden")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[MAAND6] Record geüpdatet (blessure_id={blessure_id})")
    return obj

@router.delete("/{blessure_id}")
def delete_maand6(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand6).filter(Maand6.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND6] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand6 niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[MAAND6] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Maand6 verwijderd"}
