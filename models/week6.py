# -*- coding: utf-8 -*-
from sqlalchemy import Column, BigInteger, Integer, Date, DECIMAL, Enum, ForeignKey
from sqlalchemy.orm import relationship  # ✅ nodig voor de relatie
from db import Base

class Week6(Base):
    __tablename__ = "week6"

    blessure_id = Column(
        BigInteger,
        ForeignKey("blessures.blessure_id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True
    )

    # Datum / ROM
    datum_onderzoek = Column("datum_onderzoek", Date, nullable=True)
    knie_flexie = Column("knie_flexie", Integer, nullable=True)
    knie_extensie = Column("knie_extensie", Integer, nullable=True)

    # Omtrekmetingen rond patella
    omtrek_5cm_boven_patella_l = Column("omtrek_5cm_boven_patella_l", DECIMAL(3, 1), nullable=True)
    omtrek_5cm_boven_patella_r = Column("omtrek_5cm_boven_patella_r", DECIMAL(3, 1), nullable=True)
    omtrek_10cm_boven_patella_l = Column("omtrek_10cm_boven_patella_l", DECIMAL(3, 1), nullable=True)
    omtrek_10cm_boven_patella_r = Column("omtrek_10cm_boven_patella_r", DECIMAL(3, 1), nullable=True)
    omtrek_20cm_boven_patella_l = Column("omtrek_20cm_boven_patella_l", DECIMAL(3, 1), nullable=True)
    omtrek_20cm_boven_patella_r = Column("omtrek_20cm_boven_patella_r", DECIMAL(3, 1), nullable=True)

    # Isokinetische/handheld krachtmetingen
    kracht_quadriceps_60_l = Column("kracht_quadriceps_60_l", Integer, nullable=True)
    kracht_quadriceps_60_r = Column("kracht_quadriceps_60_r", Integer, nullable=True)
    kracht_hamstrings_30_l = Column("kracht_hamstrings_30_l", Integer, nullable=True)
    kracht_hamstrings_30_r = Column("kracht_hamstrings_30_r", Integer, nullable=True)
    kracht_soleus_l = Column("kracht_soleus_l", Integer, nullable=True)
    kracht_soleus_r = Column("kracht_soleus_r", Integer, nullable=True)
    kracht_abductoren_kort_l = Column("kracht_abductoren_kort_l", Integer, nullable=True)
    kracht_abductoren_kort_r = Column("kracht_abductoren_kort_r", Integer, nullable=True)
    kracht_abductoren_lang_l = Column("kracht_abductoren_lang_l", Integer, nullable=True)
    kracht_abductoren_lang_r = Column("kracht_abductoren_lang_r", Integer, nullable=True)
    kracht_adductoren_kort_l = Column("kracht_adductoren_kort_l", Integer, nullable=True)
    kracht_adductoren_kort_r = Column("kracht_adductoren_kort_r", Integer, nullable=True)
    kracht_adductoren_lang_l = Column("kracht_adductoren_lang_l", Integer, nullable=True)
    kracht_adductoren_lang_r = Column("kracht_adductoren_lang_r", Integer, nullable=True)

    # Functionele testen
    stepdown_valgus_score_l = Column("stepdown_valgus_score_l", Integer, nullable=True)
    stepdown_valgus_score_r = Column("stepdown_valgus_score_r", Integer, nullable=True)
    stepdown_pelvische_controle_l = Column("stepdown_pelvische_controle_l", Integer, nullable=True)
    stepdown_pelvische_controle_r = Column("stepdown_pelvische_controle_r", Integer, nullable=True)

    # Squat force plate (verdeling in %)
    squat_forceplate_l = Column("squat_forceplate_l", DECIMAL(3, 1), nullable=True)
    squat_forceplate_r = Column("squat_forceplate_r", DECIMAL(3, 1), nullable=True)

    # Autorijden / re-integratie
    autorijden = Column("autorijden", Enum("Ja", "Nee", "Nvt"), nullable=True)
    autorijden_schakelen = Column("autorijden_schakelen", Enum("Manueel", "Automaat", "Nvt"), nullable=True)
    autorijden_datum = Column("autorijden_datum", Date, nullable=True)

    # Sessiecount
    aantal_sessies = Column("aantal_sessies", Integer, nullable=True)

    # Relatie met Blessure
    blessure = relationship("Blessure", back_populates="week6")
