from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import SessionLocal
from schemas.timeline import TimelineSchema
import crud
from routers.utils import ok, warn

router = APIRouter(prefix="/timeline", tags=["Timeline"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{blessure_id}", response_model=TimelineSchema)
def get_timeline(blessure_id: int, db: Session = Depends(get_db)):
    timeline = crud.get_timeline(db, blessure_id)
    if not timeline:
        warn(f"[TIMELINE] Blessure of patiënt niet gevonden (blessure_id={blessure_id})")
        raise HTTPException(404, "Blessure of patiënt niet gevonden")
    ok(f"[TIMELINE] Samengestelde timeline opgehaald (blessure_id={blessure_id})")
    return timeline
