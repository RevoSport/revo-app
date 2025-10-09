# schemas/baseline.py
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BaselineSchema(BaseModel):
    blessure_id: int
    datum_onderzoek: Optional[date] = Field(default=None, alias="Datum onderzoek")
    knie_flexie_l: Optional[int] = Field(default=None, alias="Knie flexie L")
    knie_flexie_r: Optional[int] = Field(default=None, alias="Knie flexie R")
    knie_extensie_l: Optional[int] = Field(default=None, alias="Knie extensie L")
    knie_extensie_r: Optional[int] = Field(default=None, alias="Knie extensie R")
    omtrek_5cm_boven_patella_l: Optional[float] = Field(default=None, alias="Omtrek - 5 cm boven patella L")
    omtrek_5cm_boven_patella_r: Optional[float] = Field(default=None, alias="Omtrek - 5 cm boven patella R")
    omtrek_10cm_boven_patella_l: Optional[float] = Field(default=None, alias="Omtrek - 10 cm boven patella L")
    omtrek_10cm_boven_patella_r: Optional[float] = Field(default=None, alias="Omtrek - 10 cm boven patella R")
    omtrek_20cm_boven_patella_l: Optional[float] = Field(default=None, alias="Omtrek - 20 cm boven patella L")
    omtrek_20cm_boven_patella_r: Optional[float] = Field(default=None, alias="Omtrek - 20 cm boven patella R")
    lag_test: Optional[str] = Field(default=None, alias="Lag test")
    vmo_activatie: Optional[str] = Field(default=None, alias="VMO activatie")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
