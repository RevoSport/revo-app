# =====================================================
# FILE: models/oefenschema.py
# Revo Sport — Oefenschema-module (MySQL)
# =====================================================

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

# 🔹 Patiënt (enkel voor oefenschema's)
class PatientOefen(Base):
    __tablename__ = "patienten_oefen"
    id = Column(Integer, primary_key=True, index=True)
    naam = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    schemas = relationship("Oefenschema", back_populates="patient", cascade="all, delete")

# 🔹 Oefenschema
class Oefenschema(Base):
    __tablename__ = "oefenschemas"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patienten_oefen.id"))
    datum = Column(Date, nullable=False)
    titel = Column(String(100))
    opmerkingen = Column(Text)
    pdf_path = Column(String(255))
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("PatientOefen", back_populates="schemas")
    oefeningen = relationship("Oefening", back_populates="schema", cascade="all, delete")

# 🔹 Oefeningen per schema
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
    foto_path = Column(String(500), nullable=True)

    schema = relationship("Oefenschema", back_populates="oefeningen")

# 🔹 Templates
class TemplateOefen(Base):
    __tablename__ = "templates_oefen"
    id = Column(Integer, primary_key=True, index=True)
    naam = Column(String(100))
    beschrijving = Column(Text)
    data_json = Column(JSON)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
