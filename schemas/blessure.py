# =====================================================
# FILE: schemas/blessure.py
# Revo Sport API — Pydantic Schema voor Blessure
# =====================================================

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime, date


# =====================================================
# 🔹 Geneste patiëntschema (voor gekoppelde info)
# =====================================================
class PatientNestedSchema(BaseModel):
    patient_id: Optional[int] = None
    naam: Optional[str] = None
    geslacht: Optional[str] = None
    geboortedatum: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# 🔹 Gemeenschappelijke basis (gedeeld tussen POST/PUT)
# =====================================================
class BlessureBase(BaseModel):
    # 🔹 Basisvelden uit MySQL
    zijde: Optional[str] = Field(default=None, description="Links of Rechts")
    datum_ongeval: Optional[date] = Field(default=None, description="Datum van het ongeval")
    datum_operatie: Optional[date] = Field(default=None, description="Datum van de operatie")
    datum_intake: Optional[date] = Field(default=None, description="Datum van eerste intake")

    # 🔹 Arts & therapeut
    arts: Optional[str] = Field(default=None, description="Behandelende arts")
    therapeut: Optional[str] = Field(default=None, description="Behandelende kinesitherapeut")

    # 🔹 Operatie-informatie
    etiologie: Optional[str] = Field(default=None, description="Contact of non-contact")
    operatie: Optional[str] = Field(default=None, description="Type pees of donorstructuur")
    monoloop: Optional[str] = Field(default=None, description="Ja of Nee")
    bijkomende_letsels: Optional[str] = Field(default=None, description="Aanvullende letsels")

    # 🔹 Sportinformatie
    sport: Optional[str] = Field(default=None, description="Sporttak")
    sportniveau: Optional[str] = Field(default=None, description="Recreatief, Competitief of Topsport")

    # ✅ Datumvalidatie (ondersteunt DD/MM/YYYY of YYYY-MM-DD)
    @field_validator(
        "datum_ongeval", "datum_operatie", "datum_intake", mode="before"
    )
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
# 🔹 BlessureSchema (volledige representatie met patiënt)
# =====================================================
class BlessureSchema(BlessureBase):
    blessure_id: Optional[int] = Field(default=None)
    patient_id: Optional[int] = Field(default=None)

    # ✅ Geneste patiënt (voor gekoppelde info)
    patient: Optional[PatientNestedSchema] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# =====================================================
# 🔹 BlessureUpdateSchema (voor PUT-updates)
# =====================================================
class BlessureUpdateSchema(BlessureBase):
    blessure_id: Optional[int] = None
    patient_id: Optional[int] = None
