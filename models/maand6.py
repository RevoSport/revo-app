# -*- coding: utf-8 -*-
from sqlalchemy import Column, BigInteger, Integer, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


class Maand6(Base):
    __tablename__ = "maand6"

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
    omtrek_5cm_boven_patella_l = Column(DECIMAL(3,1), nullable=True)
    omtrek_5cm_boven_patella_r = Column(DECIMAL(3,1), nullable=True)
    omtrek_10cm_boven_patella_l = Column(DECIMAL(3,1), nullable=True)
    omtrek_10cm_boven_patella_r = Column(DECIMAL(3,1), nullable=True)
    omtrek_20cm_boven_patella_l = Column(DECIMAL(3,1), nullable=True)
    omtrek_20cm_boven_patella_r = Column(DECIMAL(3,1), nullable=True)

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
    kracht_nordics_l = Column(Integer, nullable=True)
    kracht_nordics_r = Column(Integer, nullable=True)

    # === CMJ (Counter Movement Jump) ===
    cmj_asymmetrie_l = Column(DECIMAL(3,1), nullable=True)
    cmj_asymmetrie_r = Column(DECIMAL(3,1), nullable=True)
    cmj_hoogte_2benig = Column(DECIMAL(3,1), nullable=True)
    cmj_hoogte_l = Column(DECIMAL(3,1), nullable=True)
    cmj_hoogte_r = Column(DECIMAL(3,1), nullable=True)
    cmj_lsi = Column(DECIMAL(3,1), nullable=True)

    # === Drop Jump testen ===
    dropjump_hoogte_l = Column(DECIMAL(3,1), nullable=True)
    dropjump_hoogte_r = Column(DECIMAL(3,1), nullable=True)
    dropjump_rsi_l = Column(DECIMAL(2,1), nullable=True)
    dropjump_rsi_r = Column(DECIMAL(2,1), nullable=True)
    dropjump_lsi = Column(DECIMAL(3,1), nullable=True)
    dropjump_steunname_landing_l = Column(DECIMAL(3,1), nullable=True)
    dropjump_steunname_landing_r = Column(DECIMAL(3,1), nullable=True)
    dropjump_hoogte_2benig = Column(DECIMAL(3,1), nullable=True)

    # === Functionele testen ===
    single_hop_distance_l = Column(DECIMAL(4,1), nullable=True)
    single_hop_distance_r = Column(DECIMAL(4,1), nullable=True)
    sidehop_l = Column(Integer, nullable=True)
    sidehop_r = Column(Integer, nullable=True)

    # === Sessies ===
    aantal_sessies = Column(Integer, nullable=True)

    # === Relatie ===
    blessure = relationship("Blessure", back_populates="maand6", passive_deletes=True)
