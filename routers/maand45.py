from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.maand45 import Maand45
from schemas.maand45 import Maand45Schema
from routers.utils import ok, warn

router = APIRouter(prefix="/maand45", tags=["Maand 4.5"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Maand45Schema])
def list_maand45(db: Session = Depends(get_db)):
    items = db.query(Maand45).all()
    ok(f"[MAAND45] {len(items)} records opgehaald")
    return items

@router.get("/{blessure_id}", response_model=Maand45Schema)
def get_maand45(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand45).filter(Maand45.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND45] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand45 niet gevonden")
    ok(f"[MAAND45] Record opgehaald (blessure_id={blessure_id})")
    return obj

@router.post("/", response_model=Maand45Schema)
def create_maand45(data: Maand45Schema, db: Session = Depends(get_db)):
    obj = Maand45(**data.dict())
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[MAAND45] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj

@router.put("/{blessure_id}", response_model=Maand45Schema)
def update_maand45(blessure_id: int, data: Maand45Schema, db: Session = Depends(get_db)):
    obj = db.query(Maand45).filter(Maand45.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND45] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand45 niet gevonden")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[MAAND45] Record geüpdatet (blessure_id={blessure_id})")
    return obj

@router.delete("/{blessure_id}")
def delete_maand45(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Maand45).filter(Maand45.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[MAAND45] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Maand45 niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[MAAND45] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Maand45 verwijderd"}
