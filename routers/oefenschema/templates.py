# =====================================================
# FILE: routers/oefenschema/templates.py
# CRUD voor Templates (FINAL FIX VERSION)
# =====================================================

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from sqlalchemy import func
import json

from db import SessionLocal
from models.oefenschema import TemplateOefen, TemplateOefening

from onedrive_service import delete_folder_recursive
from routers.oefenschema.uploads import upload_template_image
from routers.oefenschema.path_normalizer import normalize_path
from routers.oefenschema.paths import template_folder_path
from media_cache import delete_cache_for

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
@router.get("")
def list_templates(db: Session = Depends(get_db)):
    items = (
        db.query(TemplateOefen)
        .options(joinedload(TemplateOefen.oefeningen))
        .order_by(func.coalesce(TemplateOefen.updated_at, TemplateOefen.created_at).desc())
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
# GET TEMPLATE
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

    return {
        "id": t.id,
        "naam": t.naam,
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
            for o in sorted(t.oefeningen, key=lambda x: (x.volgorde or 0))
        ]
    }


# =====================================================
# DELETE TEMPLATE
# =====================================================

@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):

    t = db.query(TemplateOefen).filter(TemplateOefen.id == template_id).first()
    if not t:
        raise HTTPException(404, "Template niet gevonden")

    oefeningen = db.query(TemplateOefening).filter(
        TemplateOefening.template_id == template_id
    ).all()

    alle_paden = []
    for o in oefeningen:
        if o.foto1: alle_paden.append(o.foto1)
        if o.foto2: alle_paden.append(o.foto2)

    db.query(TemplateOefening).filter(
        TemplateOefening.template_id == template_id
    ).delete()

    db.delete(t)
    db.commit()

    folder = template_folder_path(template_id)
    delete_folder_recursive(folder)

    for pad in alle_paden:
        delete_cache_for(pad)

    return {"status": "ok", "message": "Template + foto's verwijderd"}


# =====================================================
# CREATE TEMPLATE
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

    # FOTOVERWERKING
    for file in files or []:
        fname = file.filename

        if fname.startswith("foto1_"):
            slot = 1
            idx = int(fname.split("foto1_")[1].split(".")[0]) - 1
        elif fname.startswith("foto2_"):
            slot = 2
            idx = int(fname.split("foto2_")[1].split(".")[0]) - 1
        else:
            continue

        graph_path = await upload_template_image(
            template_id=template_id,
            oef_index=idx,   # correcte index die jij uit filename haalt
            slot=slot,
            file=file,
            old_path=None
        )


        foto_map[(idx, slot)] = normalize_path(graph_path)

    # OEFENINGEN OPSLAAN
    for idx, oef in enumerate(oefeningen):
        obj = TemplateOefening(
            template_id=template_id,
            sets=str(oef.get("sets") or ""),
            reps=str(oef.get("reps") or ""),
            tempo=str(oef.get("tempo") or ""),
            gewicht=str(oef.get("gewicht") or ""),
            opmerking=oef.get("opmerking"),
            volgorde=idx + 1,
            foto1=foto_map.get((idx, 1)),
            foto2=foto_map.get((idx, 2)),
        )
        db.add(obj)

    db.commit()
    return {"status": "ok", "id": template_id, "naam": naam}


# =====================================================
# UPDATE TEMPLATE — FINAL FIX
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

    oud = {
        o.volgorde - 1: o
        for o in db.query(TemplateOefening)
        .filter(TemplateOefening.template_id == template_id)
        .all()
    }

    existing_paths = {(idx, 1): oud[idx].foto1 for idx in oud}
    existing_paths.update({(idx, 2): oud[idx].foto2 for idx in oud})

    foto_map = {}

    # Nieuwe uploads
    for file in files or []:
        fname = file.filename

        if fname.startswith("foto1_"):
            slot = 1
            idx = int(fname.split("foto1_")[1].split(".")[0]) - 1
        elif fname.startswith("foto2_"):
            slot = 2
            idx = int(fname.split("foto2_")[1].split(".")[0]) - 1
        else:
            continue

        old_path = existing_paths.get((idx, slot))

        graph_path = await upload_template_image(
            template_id=template_id,
            oef_index=idx,
            slot=slot,
            file=file,
            old_path=old_path,
        )

        foto_map[(idx, slot)] = normalize_path(graph_path)

    # Oude records verwijderen
    db.query(TemplateOefening).filter(
        TemplateOefening.template_id == template_id
    ).delete()

    # Nieuwe records maken
    for idx, oef in enumerate(oefeningen_new):
        obj = TemplateOefening(
            template_id=template_id,
            sets=str(oef.get("sets") or ""),
            reps=str(oef.get("reps") or ""),
            tempo=str(oef.get("tempo") or ""),
            gewicht=str(oef.get("gewicht") or ""),
            opmerking=oef.get("opmerking"),
            volgorde=idx + 1,
            foto1=foto_map.get((idx, 1)) or oef.get("foto1"),
            foto2=foto_map.get((idx, 2)) or oef.get("foto2"),
        )
        db.add(obj)

    template.naam = naam
    template.created_by = created_by
    template.updated_at = datetime.now()

    db.commit()
    return {"status": "ok", "id": template_id}


# =====================================================
# DIRECT FOTO-UPLOAD
# =====================================================

@router.post("/upload/{template_id}/{oef_index}/{slot}")
async def upload_template_photo(
    template_id: int,
    oef_index: int,
    slot: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # oude foto ophalen
    oef = (
        db.query(TemplateOefening)
        .filter(
            TemplateOefening.template_id == template_id,
            TemplateOefening.volgorde == oef_index
        )
        .first()
    )

    old_path = None
    if oef:
        old_path = oef.foto1 if slot == 1 else oef.foto2

    # upload nieuwe foto + verwijder oude
    graph_path = await upload_template_image(
        template_id=template_id,
        oef_index=oef_index - 1,
        slot=slot,
        file=file,
        old_path=old_path
    )

    return {"status": "ok", "path": normalize_path(graph_path)}
