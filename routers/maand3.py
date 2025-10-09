from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.maand3 import Maand3
from schemas.maand3 import Maand3Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/maand3", tags=["Maand 3"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Maand3Schema])
def list_maand3(db: Session = Depends(get_db)):
    items = db.query(Maand3).all()
    ok(f"[MAAND3] {len(items)} records opgehaald")
    return items

@router.get("/{blessure_id}", response_model=Maand3Schema)
def get_maand3(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand3).filter(Maand3.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND3] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand3 niet gevonden")
    ok(f"[MAAND3] Record opgehaald (blessure_id={blessure_id})")
    return obj

@router.post("/", response_model=Maand3Schema)
def create_maand3(data: Maand3Schema, db: Session = Depends(get_db)):
    obj = Maand3(**data.dict())
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[MAAND3] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj

@router.put("/{blessure_id}", response_model=Maand3Schema)
def update_maand3(blessure_id: int, data: Maand3Schema, db: Session = Depends(get_db)):
    obj = db.query(Maand3).filter(Maand3.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND3] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand3 niet gevonden")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[MAAND3] Record geüpdatet (blessure_id={blessure_id})")
    return obj

@router.delete("/{blessure_id}")
def delete_maand3(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand3).filter(Maand3.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND3] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand3 niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[MAAND3] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Maand3 verwijderd"}
