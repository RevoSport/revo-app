# =====================================================
# FILE: routers/oefenschema.py
# Revo Sport — Oefenschema-module + PDF + Mail
# =====================================================

import warnings
warnings.filterwarnings("ignore", category=UserWarning)
import os
from io import BytesIO
from datetime import datetime
import requests
from onedrive_service import get_access_token, OWNER_UPN

from fastapi import APIRouter, Depends, File, Form, UploadFile, Response, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from models import User
from routers.auth_router import get_current_user

from db import SessionLocal
from models.oefenschema import (
    PatientOefen,
    Oefenschema,
    Oefening,
    TemplateOefen,
    TemplateOefening,
)

from schemas.oefenschema import (
    PatientCreate, PatientSchema,
    OefenschemaCreate, OefenschemaSchema,
)

from onedrive_service import upload_to_onedrive_bytes
from routers.utils import send_mail_mediawax


router = APIRouter(prefix="/oefenschema", tags=["Oefenschema"])


# =====================================================
# 🔹 FOUTAFHANDELING
# =====================================================
def error_response(message: str, status_code: int = 400):
    clean_message = f"❌ {message}"
    print(f"[ERROR] {clean_message}")
    return JSONResponse(status_code=status_code, content={"message": clean_message})


# =====================================================
# 🔹 DB dependency
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔹 PATIËNTEN (moeten bovenaan)
# =====================================================
@router.post("/patient", response_model=PatientSchema)
def add_patient(data: PatientCreate, db: Session = Depends(get_db)):
    patient = PatientOefen(**data.dict())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/patient", response_model=list[PatientSchema])
def list_patients(db: Session = Depends(get_db)):
    return db.query(PatientOefen).order_by(PatientOefen.naam).all()


# =====================================================
# 🔹 VEILIGE FOTOLOADER
# =====================================================
def safe_load_image_bytes(src: str):
    if not src:
        return None
    try:
        if src.startswith("http"):
            data = requests.get(src, timeout=10).content
        elif os.path.exists(src):
            with open(src, "rb") as f:
                data = f.read()
        else:
            return None

        if data.startswith(b"<!DOCTYPE") or data.startswith(b"<html"):
            print(f"❌ safe_load_image_bytes: HTML gedetecteerd → {src}")
            return None

        if len(data) == 0:
            print(f"❌ safe_load_image_bytes: lege bytes → {src}")
            return None

        return data
    except Exception as e:
        print(f"❌ safe_load_image_bytes fout ({src}): {e}")
        return None


# =====================================================
# 🔹 TEMPLATE LIJST (BOVEN schema-routes!)
# =====================================================
@router.get("/template")
def list_templates(db: Session = Depends(get_db)):
    templates = (
        db.query(TemplateOefen)
        .options(joinedload(TemplateOefen.oefeningen))
        .order_by(TemplateOefen.created_at.desc())
        .all()
    )

    result = []
    for t in templates:
        laatste = (
            t.updated_at.strftime("%d/%m/%Y %H:%M")
            if t.updated_at else
            (t.created_at.strftime("%d/%m/%Y %H:%M") if t.created_at else None)
        )
        result.append({
            "id": t.id,
            "naam": t.naam,
            "auteur": getattr(t, "created_by", "Onbekend"),
            "aantal_oefeningen": len(t.oefeningen or []),
            "laatst_gewijzigd": laatste,
        })
    return result


# =====================================================
# 🔹 TEMPLATE OPHALEN
# =====================================================
@router.get("/template/{template_id:int}")
def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template niet gevonden")

    oefeningen = (
        db.query(TemplateOefening)
        .filter(TemplateOefening.template_id == template_id)
        .order_by(TemplateOefening.volgorde.asc())
        .all()
    )

    return {
        "id": template.id,
        "naam": template.naam,
        "oefeningen": [
            {
                "sets": o.sets or "",
                "reps": o.reps or "",
                "tempo": o.tempo or "",
                "gewicht": o.gewicht or "",
                "opmerking": o.opmerking or "",
                "volgorde": o.volgorde or "",
                "foto1": o.foto1 or None,
                "foto2": o.foto2 or None,
            }
            for o in oefeningen
        ],
    }


# =====================================================
# 🔹 TEMPLATE AANMAKEN (met foto's)
# =====================================================
@router.post("/template/formdata")
async def create_template_met_fotos(
    naam: str = Form(...),
    oefeningen: str | None = Form(None),
    created_by: str = Form("Onbekend"),
    data_json: str | None = Form(None),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    import json
    from onedrive_service import upload_template_foto

    try:
        raw_oef_json = oefeningen or data_json or "[]"
        oef_lijst = json.loads(raw_oef_json)

        nieuw_template = TemplateOefen(
            naam=naam,
            created_by=created_by,
            data_json=raw_oef_json,
            created_at=datetime.utcnow(),
        )
        db.add(nieuw_template)
        db.commit()
        db.refresh(nieuw_template)

        foto_urls = {}
        print("📸 [DEBUG] Ontvangen bestanden:", [f.filename for f in (files or [])])

        for file in files or []:
            if not getattr(file, "filename", None):
                continue

            fname = file.filename
            if "foto1_" in fname:
                slot = 1
                idx = int(fname.split("foto1_")[1].split(".")[0])
            elif "foto2_" in fname:
                slot = 2
                idx = int(fname.split("foto2_")[1].split(".")[0])
            else:
                continue

            oef_volgorde = str(idx + 1)
            web_url = upload_template_foto(naam, file, oef_volgorde=oef_volgorde, slot=slot)
            foto_urls[(idx, slot)] = web_url

        for idx, oef in enumerate(oef_lijst, start=1):
            f1 = foto_urls.get((idx - 1, 1))
            f2 = foto_urls.get((idx - 1, 2))
            oef_obj = TemplateOefening(
                template_id=nieuw_template.id,
                sets=oef.get("sets"),
                reps=oef.get("reps"),
                tempo=oef.get("tempo"),
                gewicht=oef.get("gewicht"),
                opmerking=oef.get("opmerking"),
                volgorde=idx,
                foto1=f1 or oef.get("foto1"),
                foto2=f2 or oef.get("foto2"),
            )
            db.add(oef_obj)

        db.commit()
        print(f"✅ Nieuw template '{naam}' aangemaakt door {created_by} inclusief foto's")

        return {
            "status": "ok",
            "id": nieuw_template.id,
            "naam": nieuw_template.naam,
            "created_by": created_by,
        }

    except Exception as e:
        db.rollback()
        print(f"❌ [TEMPLATE CREATE MET FOTO'S] Fout: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 TEMPLATE VERWIJDEREN
# =====================================================
@router.delete("/template/{template_id:int}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    try:
        template = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template niet gevonden")

        db.query(TemplateOefening).filter(TemplateOefening.template_id == template.id).delete()
        db.delete(template)
        db.commit()
        print(f"🗑️ Template '{template.naam}' verwijderd.")
        return {"status": "ok", "message": f"Template '{template.naam}' verwijderd."}
    except Exception as e:
        db.rollback()
        print(f"❌ Fout bij verwijderen template: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================
# 🔹 TEMPLATE UPDATEN (met foto's)
# =====================================================
@router.put("/template/{template_id:int}/formdata")
async def update_template_met_fotos(
    template_id: int,
    naam: str = Form(...),
    oefeningen: str | None = Form(None),
    created_by: str = Form("Onbekend"),
    data_json: str | None = Form(None),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    import json
    from onedrive_service import upload_template_foto

    try:
        template = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template niet gevonden")

        raw_oef_json = oefeningen or data_json or "[]"
        oef_lijst = json.loads(raw_oef_json)

        template.naam = naam
        template.updated_at = datetime.utcnow()
        template.created_by = created_by or template.created_by
        template.data_json = raw_oef_json

        oude_oef = {
            o.volgorde: o
            for o in db.query(TemplateOefening)
            .filter(TemplateOefening.template_id == template.id)
            .all()
        }

        db.query(TemplateOefening).filter(
            TemplateOefening.template_id == template.id
        ).delete()

        foto_urls = {}
        print("📸 [DEBUG] Ontvangen bestanden:", [f.filename for f in (files or [])])

        for file in files or []:
            if not getattr(file, "filename", None):
                continue

            fname = file.filename
            if "foto1_" in fname:
                slot = 1
                idx = int(fname.split("foto1_")[1].split(".")[0])
            elif "foto2_" in fname:
                slot = 2
                idx = int(fname.split("foto2_")[1].split(".")[0])
            else:
                continue

            oef_volgorde = str(idx + 1)
            web_url = upload_template_foto(template.naam, file, oef_volgorde=oef_volgorde, slot=slot)
            foto_urls[(idx, slot)] = web_url

        for idx, oef in enumerate(oef_lijst, start=1):
            oud = oude_oef.get(idx)
            f1 = foto_urls.get((idx - 1, 1)) or oef.get("foto1") or (oud.foto1 if oud else None)
            f2 = foto_urls.get((idx - 1, 2)) or oef.get("foto2") or (oud.foto2 if oud else None)

            oef_obj = TemplateOefening(
                template_id=template.id,
                sets=oef.get("sets"),
                reps=oef.get("reps"),
                tempo=oef.get("tempo"),
                gewicht=oef.get("gewicht"),
                opmerking=oef.get("opmerking"),
                volgorde=idx,
                foto1=f1,
                foto2=f2,
            )
            db.add(oef_obj)

        db.commit()
        print(f"✅ Template '{template.naam}' bijgewerkt inclusief nieuwe en bestaande foto's")
        return {"status": "ok", "id": template.id, "naam": template.naam}

    except Exception as e:
        db.rollback()
        print(f"❌ [TEMPLATE UPDATE MET FOTO'S] Fout: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 TEMPLATE FOTO-UPLOAD (slot 1/2)
# =====================================================
@router.post("/template/upload-foto/{template_id:int}/{volgorde}")
async def upload_template_foto_route(
    template_id: int,
    volgorde: str,
    slot: int = 1,
    foto: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    from onedrive_service import upload_template_foto

    try:
        template = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template niet gevonden")

        oef = (
            db.query(TemplateOefening)
            .filter(TemplateOefening.template_id == template_id, TemplateOefening.volgorde == volgorde)
            .first()
        )
        if not oef:
            raise HTTPException(status_code=404, detail=f"Oefening met volgorde '{volgorde}' niet gevonden")

        web_url = upload_template_foto(template.naam, foto, oef_volgorde=volgorde, slot=slot)

        if slot == 2:
            oef.foto2 = web_url
        else:
            oef.foto1 = web_url

        db.commit()

        print(f"✅ [TEMPLATE FOTO] Oef {volgorde} (slot {slot}) → {web_url}")
        return {"status": "ok", "url": web_url}

    except Exception as e:
        db.rollback()
        print(f"❌ [TEMPLATE FOTO] Upload mislukt: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔹 TEMPLATE → PDF + upload naar OneDrive
# =====================================================
@router.post("/template/{template_id:int}/pdf")
def generate_template_pdf(template_id: int, db: Session = Depends(get_db)):
    try:
        template = (
            db.query(TemplateOefen)
            .options(joinedload(TemplateOefen.oefeningen))
            .filter(TemplateOefen.id == template_id)
            .first()
        )
        if not template:
            raise HTTPException(status_code=404, detail="Template niet gevonden")

        class DummyPatient:
            naam = f"Template – {template.naam}"

        class DummySchema:
            patient = DummyPatient()
            datum = datetime.now()
            oefeningen = template.oefeningen

        pdf_bytes = make_pdf(DummySchema())
        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="PDF-generatie mislukt")

        from onedrive_service import upload_to_onedrive_bytes, cleanup_onedrive_folder

        safe_template = template.naam.replace(" ", "_")

        cleanup_onedrive_folder(f"RevoSport/Templates/{safe_template}")

        uploaded_url = upload_to_onedrive_bytes(
            pdf_bytes,
            f"{safe_template}.pdf",
            patient_naam=safe_template,
            base_folder="RevoSport/Templates",
        )

        print(f"✅ Template-PDF geüpload → {uploaded_url}")
        return {"status": "ok", "url": uploaded_url}

    except Exception as e:
        print(f"❌ [TEMPLATE-PDF] Fout: {e}")
        raise HTTPException(status_code=500, detail=f"PDF-generatie of upload mislukt: {e}")

# =====================================================
# 🔹 SCHEMA — AANMAKEN
# =====================================================
@router.post("/", response_model=OefenschemaSchema)
def create_schema(
    data: OefenschemaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = db.query(PatientOefen).filter(PatientOefen.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    patient_safe = patient.naam.replace(" ", "_")
    date_folder = data.datum.strftime("%Y-%m-%d")

    schema = Oefenschema(
        patient_id=data.patient_id,
        datum=data.datum,
        created_by=current_user.full_name,
    )
    db.add(schema)
    db.commit()
    db.refresh(schema)

    return schema


# =====================================================
# 🔹 SCHEMA — LIJST OPHALEN
# =====================================================
@router.get("/")
def get_all_schemas(db: Session = Depends(get_db)):
    schemas = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient),
                 joinedload(Oefenschema.oefeningen))
        .order_by(Oefenschema.datum.desc())
        .all()
    )

    result = []
    for s in schemas:
        result.append({
            "id": s.id,
            "patient_naam": s.patient.naam if s.patient else "",
            "patient_email": s.patient.email if s.patient else "",
            "datum": s.datum.strftime("%Y-%m-%d"),
            "aantal_oefeningen": len(s.oefeningen or []),
            "oefeningen": [
                {
                    "sets": o.sets,
                    "reps": o.reps,
                    "tempo": o.tempo,
                    "gewicht": o.gewicht,
                    "opmerking": o.opmerking,
                    "volgorde": o.volgorde,
                    "foto1": o.foto1,
                    "foto2": o.foto2,
                }
                for o in s.oefeningen
            ],
        })
    return result


# =====================================================
# 🔹 SCHEMA — DETAILS OPHALEN
# =====================================================
@router.get("/{schema_id:int}", response_model=OefenschemaSchema)
def get_schema(schema_id: int, db: Session = Depends(get_db)):
    schema = (
        db.query(Oefenschema)
        .options(
            joinedload(Oefenschema.patient),
            joinedload(Oefenschema.oefeningen)
        )
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not schema:
        raise HTTPException(status_code=404, detail="Schema niet gevonden")

    return schema

# =====================================================
# 🔹 SCHEMA UPDATEN (MET FOTO’S)
# =====================================================
@router.put("/schema/{schema_id:int}/formdata")
async def update_schema_met_fotos(
    schema_id: int,
    datum: str = Form(...),
    patient_id: int = Form(...),
    data_json: str = Form(...),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import json
    from onedrive_service import upload_oefening_foto

    schema = db.query(Oefenschema).filter(Oefenschema.id == schema_id).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema niet gevonden")

    patient = db.query(PatientOefen).filter(PatientOefen.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patiënt niet gevonden")

    patient_safe = patient.naam.replace(" ", "_")
    date_folder = datum

    oef_lijst = json.loads(data_json)

    oude_oef = {
        o.volgorde: o
        for o in db.query(Oefening)
        .filter(Oefening.schema_id == schema.id)
        .all()
    }

    db.query(Oefening).filter(Oefening.schema_id == schema.id).delete()

    foto_urls = {}

    for file in files or []:
        fname = file.filename
        if "foto1_" in fname:
            slot = 1
            idx = int(fname.split("foto1_")[1].split(".")[0])
        elif "foto2_" in fname:
            slot = 2
            idx = int(fname.split("foto2_")[1].split(".")[0])
        else:
            continue

        volgorde = str(idx + 1)
        web_url, _ = upload_oefening_foto(
            patient_naam=patient_safe,
            datum=date_folder,
            volgorde=volgorde,
            slot=slot,
            file_bytes=await file.read(),
        )
        foto_urls[(idx, slot)] = web_url

    for idx, oef in enumerate(oef_lijst, start=1):
        oud = oude_oef.get(idx)

        f1 = foto_urls.get((idx - 1, 1)) or oef.get("foto1") or (oud.foto1 if oud else None)
        f2 = foto_urls.get((idx - 1, 2)) or oef.get("foto2") or (oud.foto2 if oud else None)

        oef_obj = Oefening(
            schema_id=schema.id,
            sets=oef.get("sets"),
            reps=oef.get("reps"),
            tempo=oef.get("tempo"),
            gewicht=oef.get("gewicht"),
            opmerking=oef.get("opmerking"),
            volgorde=str(idx),
            foto1=f1,
            foto2=f2,
        )
        db.add(oef_obj)

    schema.datum = datetime.fromisoformat(datum)
    schema.patient_id = patient_id
    schema.updated_at = datetime.utcnow()

    db.commit()

    return {"status": "ok", "id": schema.id}

# =====================================================
# 🔹 PDF PER SCHEMA OPHALEN (iframe)
# =====================================================
@router.get("/{schema_id:int}/pdf", include_in_schema=True)
def get_schema_pdf(
    schema_id: int,
    db: Session = Depends(get_db),
):

    schema = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient))
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not schema:
        raise HTTPException(status_code=404, detail="Schema niet gevonden")

    if not schema.pdf_path:
        raise HTTPException(
            status_code=404,
            detail="Geen PDF beschikbaar voor dit schema (pdf_path ontbreekt).",
        )

    graph_path = schema.pdf_path

    try:
        token = get_access_token()

        graph_url = (
            f"https://graph.microsoft.com/v1.0/users/{OWNER_UPN}"
            f"/drive/root:/{graph_path}:/content"
        )

        r = requests.get(
            graph_url, headers={"Authorization": f"Bearer {token}"}, timeout=30
        )
        r.raise_for_status()

        return Response(content=r.content, media_type="application/pdf")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF kon niet opgehaald worden via OneDrive: {e}",
        )


# =====================================================
# 🔹 MAIL ENDPOINT (schema)
# =====================================================
@router.post("/mail/{schema_id:int}")
def mail_schema(
    schema_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    schema = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.oefeningen),
                 joinedload(Oefenschema.patient))
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not schema:
        raise HTTPException(status_code=404, detail="Schema niet gevonden")

    return finalize_and_mail_schema(schema, current_user)
