from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import date, datetime

class Week6Schema(BaseModel):
    blessure_id: int

    datum_onderzoek: Optional[date] = None
    knie_flexie: Optional[int] = None
    knie_extensie: Optional[int] = None

    omtrek_5cm_boven_patella_l: Optional[float] = None
    omtrek_5cm_boven_patella_r: Optional[float] = None
    omtrek_10cm_boven_patella_l: Optional[float] = None
    omtrek_10cm_boven_patella_r: Optional[float] = None
    omtrek_20cm_boven_patella_l: Optional[float] = None
    omtrek_20cm_boven_patella_r: Optional[float] = None

    kracht_quadriceps_60_l: Optional[int] = None
    kracht_quadriceps_60_r: Optional[int] = None
    kracht_hamstrings_30_l: Optional[int] = None
    kracht_hamstrings_30_r: Optional[int] = None
    kracht_soleus_l: Optional[int] = None
    kracht_soleus_r: Optional[int] = None
    kracht_abductoren_kort_l: Optional[int] = None
    kracht_abductoren_kort_r: Optional[int] = None
    kracht_abductoren_lang_l: Optional[int] = None
    kracht_abductoren_lang_r: Optional[int] = None
    kracht_adductoren_kort_l: Optional[int] = None
    kracht_adductoren_kort_r: Optional[int] = None
    kracht_adductoren_lang_l: Optional[int] = None
    kracht_adductoren_lang_r: Optional[int] = None

    stepdown_valgus_score_l: Optional[int] = None
    stepdown_valgus_score_r: Optional[int] = None
    stepdown_pelvische_controle_l: Optional[int] = None
    stepdown_pelvische_controle_r: Optional[int] = None

    squat_forceplate_l: Optional[float] = None
    squat_forceplate_r: Optional[float] = None

    autorijden: Optional[str] = Field(default=None, pattern="^(Ja|Nee|Nvt)$")
    autorijden_schakelen: Optional[str] = Field(default=None, pattern="^(Manueel|Automaat|Nvt)$")
    autorijden_datum: Optional[date] = None

    aantal_sessies: Optional[int] = None

    @field_validator("datum_onderzoek", "autorijden_datum", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
                try:
                    return datetime.strptime(v, fmt).date()
                except ValueError:
                    continue
        return v

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
