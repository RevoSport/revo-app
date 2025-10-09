from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import SessionLocal
from models.blessure import Blessure
from schemas.blessure import BlessureSchema, BlessureUpdateSchema
from routers.utils import ok, warn

router = APIRouter(prefix="/blessures", tags=["Blessures"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[BlessureSchema])
def list_blessures(db: Session = Depends(get_db)):
    items = db.query(Blessure).all()
    ok(f"[BLESSURE] {len(items)} records opgehaald")
    return items

@router.get("/{blessure_id}", response_model=BlessureSchema)
def get_blessure(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BLESSURE] Niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Blessure niet gevonden")
    ok(f"[BLESSURE] Record opgehaald (blessure_id={blessure_id})")
    return obj

@router.post("/", response_model=BlessureSchema)
def create_blessure(data: BlessureSchema, db: Session = Depends(get_db)):
    obj = Blessure(**data.dict(exclude_unset=True))
    db.add(obj); db.commit(); db.refresh(obj)
    ok(f"[BLESSURE] Nieuw record aangemaakt (blessure_id={obj.blessure_id})")
    return obj

@router.put("/{blessure_id}", response_model=BlessureSchema)
def update_blessure(blessure_id: int, data: BlessureUpdateSchema, db: Session = Depends(get_db)):
    obj = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BLESSURE] Niet gevonden voor update (blessure_id={blessure_id})")
        raise HTTPException(404, "Blessure niet gevonden")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    ok(f"[BLESSURE] Record geüpdatet (blessure_id={blessure_id})")
    return obj

@router.delete("/{blessure_id}")
def delete_blessure(blessure_id: int, db: Session = Depends(get_db)):
    obj = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not obj:
        warn(f"[BLESSURE] Niet gevonden voor delete (blessure_id={blessure_id})")
        raise HTTPException(404, "Blessure niet gevonden")
    db.delete(obj); db.commit()
    ok(f"[BLESSURE] Record verwijderd (blessure_id={blessure_id})")
    return {"status": "✅ Blessure verwijderd"}
