# =====================================================
# FILE: routers/oefenschema/templates.py
# CRUD + foto-upload voor oefenschema templates
# =====================================================

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from sqlalchemy import func
import json

from db import SessionLocal
from models.oefenschema import TemplateOefen, TemplateOefening
from schemas.oefenschema import TemplateBase
from routers.oefenschema.uploads import upload_template_image

# BELANGRIJK: PREFIX zodat frontend werkt
router = APIRouter(prefix="/templates", tags=["Templates"])


# =====================================================
# DB SESSION
# =====================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# LIST
# =====================================================

@router.get("/")
def list_templates(db: Session = Depends(get_db)):
    items = (
        db.query(TemplateOefen)
        .options(joinedload(TemplateOefen.oefeningen))
        .order_by(
            func.coalesce(TemplateOefen.updated_at, TemplateOefen.created_at).desc()
        )
        .all()
    )

    result = []
    for t in items:
        laatste = t.updated_at or t.created_at
        result.append({
            "id": t.id,
            "naam": t.naam,
            "created_by": t.created_by,
            "laatst_gewijzigd": laatste.strftime("%Y-%m-%d %H:%M"),
            "aantal_oefeningen": len(t.oefeningen),
        })

    return result


# =====================================================
# GET 1 TEMPLATE
# =====================================================

@router.get("/{template_id}")
def get_template(template_id: int, db: Session = Depends(get_db)):
    t = (
        db.query(TemplateOefen)
        .options(joinedload(TemplateOefen.oefeningen))
        .filter(TemplateOefen.id == template_id)
        .first()
    )

    if not t:
        raise HTTPException(404, "Template niet gevonden")

    # Geen response_model → voorkomt validatieproblemen
    return {
        "id": t.id,
        "naam": t.naam,
        "beschrijving": None,
        "data_json": None,
        "created_by": t.created_by,
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
            for o in sorted(t.oefeningen, key=lambda x: int(x.volgorde or 0))
        ]
    }


# =====================================================
# DELETE
# =====================================================

@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    t = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
    if not t:
        raise HTTPException(404, "Template niet gevonden")

    db.query(TemplateOefening).filter(
        TemplateOefening.template_id == template_id
    ).delete()

    db.delete(t)
    db.commit()

    return {"status": "ok", "message": "Template verwijderd"}


# =====================================================
# CREATE
# =====================================================

@router.post("/create")
async def create_template(
    naam: str = Form(...),
    created_by: str = Form("Onbekend"),
    oefeningen_json: str = Form(...),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    template = TemplateOefen(
        naam=naam,
        created_by=created_by,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    template_id = template.id
    oefeningen = json.loads(oefeningen_json)

    foto_map = {}

    # Foto's koppelen op basis van zero-index
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

        graph_path = await upload_template_image(
            template_id=template_id,
            oef_index=idx,
            slot=slot,
            file=file
        )

        foto_map[(idx, slot)] = graph_path

    # Oefeningen opslaan (zero-index → volgorde = idx+1)
    for idx, oef in enumerate(oefeningen):
        obj = TemplateOefening(
            template_id=template_id,
            sets=oef.get("sets"),
            reps=oef.get("reps"),
            tempo=oef.get("tempo"),
            gewicht=oef.get("gewicht"),
            opmerking=oef.get("opmerking"),
            volgorde=idx + 1,
            foto1=foto_map.get((idx, 1)),
            foto2=foto_map.get((idx, 2)),
        )
        db.add(obj)

    db.commit()

    return {"status": "ok", "id": template_id, "naam": naam}


# =====================================================
# UPDATE
# =====================================================

@router.put("/update/{template_id}")
async def update_template(
    template_id: int,
    naam: str = Form(...),
    created_by: str = Form("Onbekend"),
    oefeningen_json: str = Form(...),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    template = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
    if not template:
        raise HTTPException(404, "Template niet gevonden")

    oefeningen_new = json.loads(oefeningen_json)

    # Oud volgens volgorde (1-based)
    oud = {
        o.volgorde: o
        for o in db.query(TemplateOefening)
        .filter(TemplateOefening.template_id == template_id)
        .all()
    }

    foto_map = {}

    # Foto-uploads (zero-index)
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

        graph_path = await upload_template_image(
            template_id=template_id,
            oef_index=idx,
            slot=slot,
            file=file
        )
        foto_map[(idx, slot)] = graph_path

    # Reset alle oefeningen
    db.query(TemplateOefening).filter(
        TemplateOefening.template_id == template_id
    ).delete()

    # Heropbouwen: zero-index → volgorde = idx + 1
    for idx, oef in enumerate(oefeningen_new):
        volgorde = idx + 1
        oud_obj = oud.get(volgorde)

        f1 = foto_map.get((idx, 1)) or oef.get("foto1") or (oud_obj.foto1 if oud_obj else None)
        f2 = foto_map.get((idx, 2)) or oef.get("foto2") or (oud_obj.foto2 if oud_obj else None)

        obj = TemplateOefening(
            template_id=template_id,
            sets=oef.get("sets"),
            reps=oef.get("reps"),
            tempo=oef.get("tempo"),
            gewicht=oef.get("gewicht"),
            opmerking=oef.get("opmerking"),
            volgorde=volgorde,
            foto1=f1,
            foto2=f2,
        )
        db.add(obj)

    template.naam = naam
    template.created_by = created_by
    template.updated_at = datetime.now()

    db.commit()

    return {"status": "ok", "id": template_id}
