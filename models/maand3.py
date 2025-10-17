# -*- coding: utf-8 -*-
from sqlalchemy import Column, BigInteger, Integer, Date, DECIMAL, Enum, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


class Maand3(Base):
    __tablename__ = "maand3"

    blessure_id = Column(
        BigInteger,
        ForeignKey("blessures.blessure_id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
        index=True
    )

    # === Algemene gegevens ===
    datum_onderzoek = Column(Date, nullable=True)
    knie_flexie = Column(Integer, nullable=True)
    knie_extensie = Column(Integer, nullable=True)

    # === Omtrekmetingen ===
    omtrek_5cm_boven_patella_l = Column(DECIMAL(3, 1), nullable=True)
    omtrek_5cm_boven_patella_r = Column(DECIMAL(3, 1), nullable=True)
    omtrek_10cm_boven_patella_l = Column(DECIMAL(3, 1), nullable=True)
    omtrek_10cm_boven_patella_r = Column(DECIMAL(3, 1), nullable=True)
    omtrek_20cm_boven_patella_l = Column(DECIMAL(3, 1), nullable=True)
    omtrek_20cm_boven_patella_r = Column(DECIMAL(3, 1), nullable=True)  # aangepast van int → DECIMAL

    # === Krachtmetingen ===
    kracht_quadriceps_60_l = Column(Integer, nullable=True)
    kracht_quadriceps_60_r = Column(Integer, nullable=True)
    kracht_hamstrings_30_l = Column(Integer, nullable=True)
    kracht_hamstrings_30_r = Column(Integer, nullable=True)
    kracht_hamstrings_90_90_l = Column(Integer, nullable=True)
    kracht_hamstrings_90_90_r = Column(Integer, nullable=True)
    kracht_soleus_l = Column(Integer, nullable=True)
    kracht_soleus_r = Column(Integer, nullable=True)
    kracht_abductoren_kort_l = Column(Integer, nullable=True)
    kracht_abductoren_kort_r = Column(Integer, nullable=True)
    kracht_abductoren_lang_l = Column(Integer, nullable=True)
    kracht_abductoren_lang_r = Column(Integer, nullable=True)
    kracht_adductoren_kort_l = Column(Integer, nullable=True)
    kracht_adductoren_kort_r = Column(Integer, nullable=True)
    kracht_adductoren_lang_l = Column(Integer, nullable=True)
    kracht_adductoren_lang_r = Column(Integer, nullable=True)
    kracht_exorotatoren_heup_l = Column(Integer, nullable=True)
    kracht_exorotatoren_heup_r = Column(Integer, nullable=True)

    # === Functionele testen ===
    squat_forceplate_l = Column(DECIMAL(3, 1), nullable=True)
    squat_forceplate_r = Column(DECIMAL(3, 1), nullable=True)
    stepdown_valgus_score_l = Column(Integer, nullable=True)
    stepdown_valgus_score_r = Column(Integer, nullable=True)
    stepdown_pelvische_controle_l = Column(Integer, nullable=True)
    stepdown_pelvische_controle_r = Column(Integer, nullable=True)

    # === Springtesten ===
    cmj_asymmetrie_l = Column(DECIMAL(3, 1), nullable=True)
    cmj_asymmetrie_r = Column(DECIMAL(3, 1), nullable=True)
    cmj_hoogte_2benig = Column(Integer, nullable=True)

    # === Rijvaardigheid ===
    autorijden = Column(Enum("Ja", "Nee", "Nvt"), nullable=True)
    autorijden_schakelen = Column(Enum("Manueel", "Automaat", "Nvt"), nullable=True)


    # === Sessies ===
    aantal_sessies = Column(Integer, nullable=True)

    # === Relatie ===
    blessure = relationship("Blessure", back_populates="maand3", passive_deletes=True)
