# =====================================================
# FILE: schemas/oefenschema.py
# Revo Sport — Pydantic Schemas (Corrected & Unified)
# =====================================================

from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


# -----------------------------------------------------
# 🔹 TemplateOefening
# -----------------------------------------------------
class TemplateOefeningBase(BaseModel):
    sets: Optional[str] = None
    reps: Optional[str] = None
    tempo: Optional[str] = None
    gewicht: Optional[str] = None
    opmerking: Optional[str] = None
    volgorde: Optional[int] = None
    foto1: Optional[str] = None
    foto2: Optional[str] = None


class TemplateOefeningSchema(TemplateOefeningBase):
    id: int

    class Config:
        orm_mode = True


# -----------------------------------------------------
# 🔹 Template
# -----------------------------------------------------
class TemplateBase(BaseModel):
    naam: str
    data_json: Optional[dict] = None
    created_by: Optional[str] = None


class TemplateCreate(TemplateBase):
    pass


class TemplateSchema(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    oefeningen: List[TemplateOefeningSchema] = []

    class Config:
        orm_mode = True


# -----------------------------------------------------
# 🔹 Oefening (schema niveau)
# -----------------------------------------------------
class OefeningBase(BaseModel):
    volgorde: Optional[int] = None
    opmerking: Optional[str] = None
    foto1: Optional[str] = None
    foto2: Optional[str] = None

    # 🔧 Harmonisatie types
    sets: Optional[str] = None
    reps: Optional[str] = None
    tempo: Optional[str] = None
    gewicht: Optional[str] = None

    # 🔧 Kritiek: template-koppeling
    template_id: Optional[int] = None


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


class OefenschemaUpdate(OefenschemaBase):
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
# 🔹 PDF-aanvraag
# -----------------------------------------------------
class OefenschemaPDFRequest(BaseModel):
    schema_id: int
    extra_bericht: Optional[str] = None
