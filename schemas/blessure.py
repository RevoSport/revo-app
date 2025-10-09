from pydantic import BaseModel, ConfigDict, field_validator, Field
from typing import Optional
from datetime import datetime, date


class BlessureBase(BaseModel):
    zijde: Optional[str] = Field(default=None, alias="Zijde")
    datum_ongeval: Optional[date] = Field(default=None, alias="Datum ongeval")
    datum_operatie: Optional[date] = Field(default=None, alias="Datum operatie")
    datum_intake: Optional[date] = Field(default=None, alias="Datum intake")
    arts: Optional[str] = Field(default=None, alias="Arts")
    therapeut: Optional[str] = Field(default=None, alias="Therapeut")
    etiologie: Optional[str] = Field(default=None, alias="Etiologie")
    operatie: Optional[str] = Field(default=None, alias="Operatie")
    monoloop: Optional[str] = Field(default=None, alias="Monoloop")
    bijkomende_letsels: Optional[str] = Field(default=None, alias="Bijkomende letsels")
    sport: Optional[str] = Field(default=None, alias="Sport")
    sportniveau: Optional[str] = Field(default=None, alias="Sportniveau")

    @field_validator("datum_ongeval", "datum_operatie", "datum_intake", mode="before")
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


class BlessureSchema(BlessureBase):
    patient_id: int = Field(alias="patient_id")
    blessure_id: Optional[int] = Field(default=None, alias="blessure_id")


class BlessureUpdateSchema(BlessureBase):
    patient_id: Optional[int] = None
    blessure_id: Optional[int] = None
