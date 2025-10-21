# =====================================================
# FILE: schemas/blessure.py
# Revo Sport API — Pydantic Schema voor Blessure
# =====================================================

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime, date


# =====================================================
# 🔹 Gemeenschappelijke basis (shared fields)
# =====================================================
class BlessureBase(BaseModel):
    type: Optional[str] = Field(default=None, alias="Type")
    zijde: Optional[str] = Field(default=None, alias="Zijde")
    operatiedatum: Optional[date] = Field(default=None, alias="Operatiedatum")
    etiologie: Optional[str] = Field(default=None, alias="Etiologie")
    operatie: Optional[str] = Field(default=None, alias="Operatie")
    bijkomende_letsels: Optional[str] = Field(default=None, alias="Bijkomende letsels")
    sport: Optional[str] = Field(default=None, alias="Sport")
    sportniveau: Optional[str] = Field(default=None, alias="Sportniveau")

    # ✅ Datumvalidatie (flexibel voor DD/MM/YYYY of YYYY-MM-DD)
    @field_validator("operatiedatum", mode="before")
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


# =====================================================
# 🔹 BlessureSchema (volledige representatie)
# =====================================================
class BlessureSchema(BlessureBase):
    blessure_id: Optional[int] = Field(default=None, alias="blessure_id")
    patient_id: Optional[int] = Field(default=None, alias="patient_id")


# =====================================================
# 🔹 BlessureUpdateSchema (voor updates)
# =====================================================
class BlessureUpdateSchema(BlessureBase):
    blessure_id: Optional[int] = None
    patient_id: Optional[int] = None
