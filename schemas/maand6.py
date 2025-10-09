# -*- coding: utf-8 -*-
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class Maand6Schema(BaseModel):
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
    kracht_nordics_l: Optional[int] = Field(default=None, alias="Kracht - Nordics L")
    kracht_nordics_r: Optional[int] = Field(default=None, alias="Kracht - Nordics R")

    # === CMJ (Counter Movement Jump) ===
    cmj_asymmetrie_l: Optional[float] = Field(default=None, alias="CMJ - Asymmetrie L")
    cmj_asymmetrie_r: Optional[float] = Field(default=None, alias="CMJ - Asymmetrie R")
    cmj_hoogte_2benig: Optional[float] = Field(default=None, alias="CMJ - Hoogte (2benig)")
    cmj_hoogte_l: Optional[float] = Field(default=None, alias="CMJ - Hoogte (L)")
    cmj_hoogte_r: Optional[float] = Field(default=None, alias="CMJ - Hoogte (R)")
    cmj_lsi: Optional[float] = Field(default=None, alias="CMJ - LSI")

    # === Drop Jump testen ===
    dropjump_hoogte_l: Optional[float] = Field(default=None, alias="Drop Jump - Hoogte (L)")
    dropjump_hoogte_r: Optional[float] = Field(default=None, alias="Drop Jump - Hoogte (R)")
    dropjump_rsi_l: Optional[float] = Field(default=None, alias="Drop Jump - RSI (L)")
    dropjump_rsi_r: Optional[float] = Field(default=None, alias="Drop Jump - RSI (R)")
    dropjump_lsi: Optional[float] = Field(default=None, alias="Drop Jump - LSI")
    dropjump_steunname_landing_l: Optional[float] = Field(default=None, alias="Drop Jump (2benig) - Steunname Landing (%) (L)")
    dropjump_steunname_landing_r: Optional[float] = Field(default=None, alias="Drop Jump (2benig) - Steunname Landing (%) (R)")
    dropjump_hoogte_2benig: Optional[float] = Field(default=None, alias="Drop Jump (2benig) - Hoogte")

    # === Functionele testen ===
    single_hop_distance_l: Optional[float] = Field(default=None, alias="Single Hop - Distance (L)")
    single_hop_distance_r: Optional[float] = Field(default=None, alias="Single Hop - Distance (R)")
    sidehop_l: Optional[int] = Field(default=None, alias="Side Hop (L)")
    sidehop_r: Optional[int] = Field(default=None, alias="Side Hop (R)")

    # === Sessies ===
    aantal_sessies: Optional[int] = Field(default=None, alias="Aantal sessies")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
