# =====================================================
# FILE: routers/health.py
# Revo Sport — Health check
# =====================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from db import get_db

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Simpele DB health check.
    """
    result = db.execute(text("SELECT 1")).scalar()
    return {
        "status": "ok",
        "db": result
    }
