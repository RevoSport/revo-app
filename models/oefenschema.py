# =====================================================
# FILE: models/oefenschema.py
# Revo Sport — Oefenschema-module (MySQL)
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
    patient_id = Column(Integer, ForeignKey("patienten_oefen.id"))
    datum = Column(Date, nullable=False)
    pdf_path = Column(String(255))
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("PatientOefen", back_populates="schemas")
    oefeningen = relationship("Oefening", back_populates="schema", cascade="all, delete")


# =====================================================
# 🔹 Oefening (alleen gekoppeld aan Oefenschema)
# =====================================================
class Oefening(Base):
    __tablename__ = "oefeningen"

    id = Column(Integer, primary_key=True, index=True)
    schema_id = Column(Integer, ForeignKey("oefenschemas.id"))
    volgorde = Column(String(10))
    opmerking = Column(Text)
    foto1 = Column(String(255))
    foto2 = Column(String(255))
    sets = Column(Integer)
    reps = Column(Integer)
    tempo = Column(String(50))
    gewicht = Column(String(50))

    schema = relationship("Oefenschema", back_populates="oefeningen")


# =====================================================
# 🔹 TemplateOefen (voor herbruikbare sjablonen)
# =====================================================
class TemplateOefen(Base):
    __tablename__ = "templates_oefen"

    id = Column(Integer, primary_key=True, index=True)
    naam = Column(String(100), nullable=False)
    data_json = Column(Text, nullable=True)  # 🆕 JSON-back-up van oefeningen
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 🔹 toevoegen

    oefeningen = relationship(
        "TemplateOefening",
        cascade="all, delete",
        back_populates="template"
    )


# =====================================================
# 🔹 TemplateOefening (oefeningen binnen een template)
# =====================================================
class TemplateOefening(Base):
    __tablename__ = "template_oefeningen"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates_oefen.id", ondelete="CASCADE"))

    sets = Column(String(10), nullable=True)
    reps = Column(String(10), nullable=True)
    tempo = Column(String(10), nullable=True)
    gewicht = Column(String(10), nullable=True)
    opmerking = Column(Text, nullable=True)
    volgorde = Column(Integer, nullable=True)
    foto1 = Column(String(500), nullable=True)
    foto2 = Column(String(500), nullable=True)

    template = relationship("TemplateOefen", back_populates="oefeningen")
