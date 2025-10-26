# =====================================================
# FILE: schemas/baseline.py
# Revo Sport API — Pydantic Schema voor Baseline testing
# =====================================================

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


# =====================================================
# 🔹 BaselineSchema
# =====================================================
class BaselineSchema(BaseModel):
    blessure_id: int

    # 🔹 Algemene info
    datum_onderzoek: Optional[date] = Field(default=None, description="Datum van baseline onderzoek")

    # 🔹 Knie mobiliteit
    knie_flexie_l: Optional[int] = Field(default=None, description="Flexie links (°)")
    knie_flexie_r: Optional[int] = Field(default=None, description="Flexie rechts (°)")
    knie_extensie_l: Optional[int] = Field(default=None, description="Extensie links (°)")
    knie_extensie_r: Optional[int] = Field(default=None, description="Extensie rechts (°)")

    # 🔹 Omtrekmetingen
    omtrek_5cm_boven_patella_l: Optional[float] = Field(default=None, description="Omtrek 5 cm boven patella L")
    omtrek_5cm_boven_patella_r: Optional[float] = Field(default=None, description="Omtrek 5 cm boven patella R")
    omtrek_10cm_boven_patella_l: Optional[float] = Field(default=None, description="Omtrek 10 cm boven patella L")
    omtrek_10cm_boven_patella_r: Optional[float] = Field(default=None, description="Omtrek 10 cm boven patella R")
    omtrek_20cm_boven_patella_l: Optional[float] = Field(default=None, description="Omtrek 20 cm boven patella L")
    omtrek_20cm_boven_patella_r: Optional[float] = Field(default=None, description="Omtrek 20 cm boven patella R")

    # 🔹 Functionele observaties
    lag_test: Optional[str] = Field(default=None, description="Lag test (Ja/Nee)")
    vmo_activatie: Optional[str] = Field(default=None, description="VMO activatie (Ja/Nee)")

    # ✅ Datumvalidatie (ondersteunt zowel DD/MM/YYYY als YYYY-MM-DD)
    @field_validator("datum_onderzoek", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
                try:
                    return datetime.strptime(v, fmt).date()
                except ValueError:
                    continue
            raise ValueError("Datum moet in DD/MM/YYYY of YYYY-MM-DD formaat staan")
        return v

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
