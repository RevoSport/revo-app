# =====================================================
# FILE: schemas/patient.py
# Revo Sport API — Pydantic Schema voor Patiënt (v2)
# =====================================================

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from schemas.blessure import BlessureSchema


# =====================================================
# 🔹 Patiënt Schema
# =====================================================
class PatientSchema(BaseModel):
    patient_id: Optional[int] = None
    naam: str = Field(..., alias="Naam")
    geslacht: Optional[str] = Field(default=None, alias="Geslacht")
    geboortedatum: Optional[date] = Field(default=None, alias="Geboortedatum")
    blessures: List[BlessureSchema] = Field(default_factory=list)

    # ✅ Datumvalidatie (DD/MM/YYYY of YYYY-MM-DD)
    @field_validator("geboortedatum", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
                try:
                    return datetime.strptime(v, fmt).date()
                except ValueError:
                    continue
            raise ValueError("Datum moet in formaat DD/MM/YYYY of YYYY-MM-DD")
        return v

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
