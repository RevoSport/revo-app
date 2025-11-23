# =====================================================
# FILE: schemas/oefenschema.py
# Revo Sport — Pydantic Schemas voor Oefenschema-module
# =====================================================

from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

# -----------------------------------------------------
# 🔹 Oefening
# -----------------------------------------------------
class OefeningBase(BaseModel):
    volgorde: Optional[str] = None
    opmerking: Optional[str] = None
    foto1: Optional[str] = None
    foto2: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    tempo: Optional[str] = None
    gewicht: Optional[str] = None


class OefeningCreate(OefeningBase):
    pass


class OefeningSchema(OefeningBase):
    id: int

    class Config:
        orm_mode = True


# -----------------------------------------------------
# 🔹 Oefenschema
# -----------------------------------------------------
class OefenschemaBase(BaseModel):
    patient_id: int
    datum: date
    created_by: Optional[str] = None


class OefenschemaCreate(OefenschemaBase):
    oefeningen: List[OefeningCreate]


class OefenschemaSchema(OefenschemaBase):
    id: int
    pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    oefeningen: List[OefeningSchema] = []

    class Config:
        orm_mode = True


# -----------------------------------------------------
# 🔹 Patiënt
# -----------------------------------------------------
class PatientBase(BaseModel):
    naam: str
    email: str


class PatientCreate(PatientBase):
    pass


class PatientSchema(PatientBase):
    id: int

    class Config:
        orm_mode = True


# -----------------------------------------------------
# 🔹 Template
# -----------------------------------------------------
class TemplateBase(BaseModel):
    naam: str
    beschrijving: Optional[str] = None
    data_json: Optional[dict] = None
    created_by: Optional[str] = None


class TemplateSchema(TemplateBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


# -----------------------------------------------------
# 🔹 PDF-aanvraag
# -----------------------------------------------------
class OefenschemaPDFRequest(BaseModel):
    schema_id: int
    extra_bericht: Optional[str] = None
