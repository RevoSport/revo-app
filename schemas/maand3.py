# -*- coding: utf-8 -*-
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class Maand3Schema(BaseModel):
    blessure_id: int
    datum_onderzoek: Optional[date] = Field(default=None, alias="Datum onderzoek")

    # === Knie mobiliteit ===
    knie_flexie: Optional[int] = Field(default=None, alias="Knie flexie")
    knie_extensie: Optional[int] = Field(default=None, alias="Knie extensie")

    # === Omtrekmetingen ===
    omtrek_5cm_boven_patella_l: Optional[float] = Field(default=None, alias="Omtrek - 5 cm boven patella L")
    omtrek_5cm_boven_patella_r: Optional[float] = Field(default=None, alias="Omtrek - 5 cm boven patella R")
    omtrek_10cm_boven_patella_l: Optional[float] = Field(default=None, alias="Omtrek - 10 cm boven patella L")
    omtrek_10cm_boven_patella_r: Optional[float] = Field(default=None, alias="Omtrek - 10 cm boven patella R")
    omtrek_20cm_boven_patella_l: Optional[float] = Field(default=None, alias="Omtrek - 20 cm boven patella L")
    omtrek_20cm_boven_patella_r: Optional[float] = Field(default=None, alias="Omtrek - 20 cm boven patella R")

    # === Krachtmetingen ===
    kracht_quadriceps_60_l: Optional[int] = Field(default=None, alias="Kracht - Quadriceps (60°) L")
    kracht_quadriceps_60_r: Optional[int] = Field(default=None, alias="Kracht - Quadriceps (60°) R")
    kracht_hamstrings_30_l: Optional[int] = Field(default=None, alias="Kracht - Hamstrings (30°) L")
    kracht_hamstrings_30_r: Optional[int] = Field(default=None, alias="Kracht - Hamstrings (30°) R")
    kracht_hamstrings_90_90_l: Optional[int] = Field(default=None, alias="Kracht - Hamstrings (90-90°) L")
    kracht_hamstrings_90_90_r: Optional[int] = Field(default=None, alias="Kracht - Hamstrings (90-90°) R")
    kracht_soleus_l: Optional[int] = Field(default=None, alias="Kracht - Soleus L")
    kracht_soleus_r: Optional[int] = Field(default=None, alias="Kracht - Soleus R")
    kracht_abductoren_kort_l: Optional[int] = Field(default=None, alias="Kracht - Abductoren (kort) L")
    kracht_abductoren_kort_r: Optional[int] = Field(default=None, alias="Kracht - Abductoren (kort) R")
    kracht_abductoren_lang_l: Optional[int] = Field(default=None, alias="Kracht - Abductoren (lang) L")
    kracht_abductoren_lang_r: Optional[int] = Field(default=None, alias="Kracht - Abductoren (lang) R")
    kracht_adductoren_kort_l: Optional[int] = Field(default=None, alias="Kracht - Adductoren (kort) L")
    kracht_adductoren_kort_r: Optional[int] = Field(default=None, alias="Kracht - Adductoren (kort) R")
    kracht_adductoren_lang_l: Optional[int] = Field(default=None, alias="Kracht - Adductoren (lang) L")
    kracht_adductoren_lang_r: Optional[int] = Field(default=None, alias="Kracht - Adductoren (lang) R")
    kracht_exorotatoren_heup_l: Optional[int] = Field(default=None, alias="Kracht - Exorotatoren (heup) L")
    kracht_exorotatoren_heup_r: Optional[int] = Field(default=None, alias="Kracht - Exorotatoren (heup) R")

    # === Functionele testen ===
    squat_forceplate_l: Optional[float] = Field(default=None, alias="Squat (90°) - Force plate % (L)")
    squat_forceplate_r: Optional[float] = Field(default=None, alias="Squat (90°) - Force plate % (R)")
    stepdown_valgus_score_l: Optional[int] = Field(default=None, alias="Stepdown - Valgus score L")
    stepdown_valgus_score_r: Optional[int] = Field(default=None, alias="Stepdown - Valgus score R")
    stepdown_pelvische_controle_l: Optional[int] = Field(default=None, alias="Stepdown - Pelvische controle L")
    stepdown_pelvische_controle_r: Optional[int] = Field(default=None, alias="Stepdown - Pelvische controle R")

    # === Springtesten ===
    cmj_asymmetrie_l: Optional[float] = Field(default=None, alias="Counter Movement Jump (landing) % L")
    cmj_asymmetrie_r: Optional[float] = Field(default=None, alias="Counter Movement Jump (landing) % R")
    cmj_hoogte_2benig: Optional[int] = Field(default=None, alias="Counter Movement Jump - hoogte (2-benig)")

    # === Rijvaardigheid en sessies ===
    autorijden: Optional[str] = Field(default=None, alias="Autorijden")
    autorijden_schakelen: Optional[str] = Field(default=None, alias="Autorijden - schakelen")
    autorijden_datum: Optional[date] = Field(default=None, alias="Autorijden - datum")
    aantal_sessies: Optional[int] = Field(default=None, alias="Aantal sessies")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
