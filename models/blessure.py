# -*- coding: utf-8 -*-
from sqlalchemy import Column, BigInteger, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from db import Base


class Blessure(Base):
    __tablename__ = "blessures"

    blessure_id = Column(BigInteger, primary_key=True, autoincrement=True)
    patient_id = Column(
        BigInteger,
        ForeignKey("patienten.patient_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True
    )

    # === Basisinformatie ===
    zijde = Column(Enum("Links", "Rechts"), nullable=True)
    datum_ongeval = Column(Date, nullable=True)
    datum_operatie = Column(Date, nullable=True)
    datum_intake = Column(Date, nullable=True)

    arts = Column(Enum(
        "Dr. Byn", "Dr. Dobbelaere", "Dr. De Neve", "Dr. Moens",
        "Dr. Schepens", "Dr. Van Onsem", "Dr. Vansintjan"
    ), nullable=True)

    therapeut = Column(Enum(
        "Annelien", "Frederic", "Jasper", "Maité",
        "Pepijn", "Robbe", "Ruben", "Sander"
    ), nullable=True)

    etiologie = Column(Enum("Contact", "Non-contact"), nullable=True)

    operatie = Column(Enum(
        "Hamstring pees", "Quadriceps pees", "Donorpees",
        "Patellapees", "Niet gekend"
    ), nullable=True)

    monoloop = Column(Enum("Ja", "Nee"), nullable=True)

    bijkomende_letsels = Column(Enum(
        "Meniscushechting", "Meniscus dissectie",
        "Mediale band", "Kraakbeen revise", "Nvt"
    ), nullable=True)

    sport = Column(Enum(
        "Basketbal", "Handbal", "Hockey", "Korfbal", "Rugby",
        "Skiën", "Turnen", "Voetbal", "Volleybal", "Ander",
        "Niet Van Toepassing"
    ), nullable=True)

    sportniveau = Column(Enum(
        "Sedentair", "Recreatief", "Competitief", "Topsport",
        "Niet Van Toepassing"
    ), nullable=True)

    # === Relaties ===
    patient = relationship("Patient", back_populates="blessures", passive_deletes=True)
    baseline = relationship("Baseline", back_populates="blessure", uselist=False, passive_deletes=True)
    week6 = relationship("Week6", back_populates="blessure", uselist=False, passive_deletes=True)
    maand3 = relationship("Maand3", back_populates="blessure", uselist=False, passive_deletes=True)
    maand45 = relationship("Maand45", back_populates="blessure", uselist=False, passive_deletes=True)
    maand6 = relationship("Maand6", back_populates="blessure", uselist=False, passive_deletes=True)
