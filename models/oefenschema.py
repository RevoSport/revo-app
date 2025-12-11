# =====================================================
# FILE: models/oefenschema.py
# Revo Sport — Oefenschema-module (Corrected & Unified)
# =====================================================

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

# =====================================================
# 🔹 Patiënt (enkel voor oefenschema's)
# =====================================================
class PatientOefen(Base):
    __tablename__ = "patienten_oefen"

    id = Column(Integer, primary_key=True, index=True)
    naam = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    schemas = relationship("Oefenschema", back_populates="patient", cascade="all, delete")


# =====================================================
# 🔹 Oefenschema
# =====================================================
class Oefenschema(Base):
    __tablename__ = "oefenschemas"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patienten_oefen.id", ondelete="CASCADE"))
    datum = Column(Date, nullable=False)
    pdf_path = Column(String(500))
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("PatientOefen", back_populates="schemas")
    oefeningen = relationship(
        "Oefening",
        back_populates="schema",
        cascade="all, delete-orphan",
        order_by="Oefening.volgorde"
    )


# =====================================================
# 🔹 Oefening (correct, template-compatibel)
# =====================================================
class Oefening(Base):
    __tablename__ = "oefeningen"

    id = Column(Integer, primary_key=True, index=True)

    # Correcte FK naar schema
    schema_id = Column(Integer, ForeignKey("oefenschemas.id", ondelete="CASCADE"))

    # 🔧 Volgorde harmonie met templates → INT
    volgorde = Column(Integer, nullable=True)

    opmerking = Column(Text)

    # 🔧 Foto-paden altijd 500 chars (SharePoint + proxy compatibiliteit)
    foto1 = Column(String(500))
    foto2 = Column(String(500))

    # 🔧 Harmonisatie met templates → altijd String
    sets = Column(String(10))
    reps = Column(String(10))
    tempo = Column(String(50))
    gewicht = Column(String(50))

    # 🔧 Ontbrekende template-koppeling
    template_id = Column(Integer, ForeignKey("templates_oefen.id", ondelete="SET NULL"), nullable=True)
    template = relationship("TemplateOefen")

    schema = relationship("Oefenschema", back_populates="oefeningen")


# =====================================================
# 🔹 TemplateOefen
# =====================================================
class TemplateOefen(Base):
    __tablename__ = "templates_oefen"

    id = Column(Integer, primary_key=True, index=True)
    naam = Column(String(100), nullable=False)

    # Bewaart JSON-backup
    data_json = Column(Text)

    created_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    oefeningen = relationship(
        "TemplateOefening",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateOefening.volgorde"
    )


# =====================================================
# 🔹 TemplateOefening
# =====================================================
class TemplateOefening(Base):
    __tablename__ = "template_oefeningen"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates_oefen.id", ondelete="CASCADE"))

    # Zelfde structuur als Oefening
    sets = Column(String(10))
    reps = Column(String(10))
    tempo = Column(String(10))
    gewicht = Column(String(10))
    opmerking = Column(Text)
    volgorde = Column(Integer, nullable=True)

    foto1 = Column(String(500))
    foto2 = Column(String(500))

    template = relationship("TemplateOefen", back_populates="oefeningen")
