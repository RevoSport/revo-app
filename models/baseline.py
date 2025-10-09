from sqlalchemy import Column, Integer, Date, DECIMAL, Enum, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


class Baseline(Base):
    __tablename__ = "baseline"

    blessure_id = Column(
        BigInteger,
        ForeignKey("blessures.blessure_id", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
        index=True
    )

    datum_onderzoek = Column(Date)
    knie_flexie_l = Column(Integer)
    knie_flexie_r = Column(Integer)
    knie_extensie_l = Column(Integer)
    knie_extensie_r = Column(Integer)
    omtrek_5cm_boven_patella_l = Column(DECIMAL(3,1))
    omtrek_5cm_boven_patella_r = Column(DECIMAL(3,1))
    omtrek_10cm_boven_patella_l = Column(DECIMAL(3,1))
    omtrek_10cm_boven_patella_r = Column(DECIMAL(3,1))
    omtrek_20cm_boven_patella_l = Column(DECIMAL(3,1))
    omtrek_20cm_boven_patella_r = Column(DECIMAL(3,1))
    lag_test = Column(Enum("Ja", "Nee"))
    vmo_activatie = Column(Enum("Ja", "Nee"))

    blessure = relationship("Blessure", back_populates="baseline", passive_deletes=True)
