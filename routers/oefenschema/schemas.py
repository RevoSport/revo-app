# =====================================================
# FILE: routers/oefenschema/schemas.py
# CRUD voor Oefenschema + foto uploads (A-FLOW SUPERSNEL)
# =====================================================

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, date
import json

from db import SessionLocal
from models.oefenschema import Oefenschema, Oefening

# Upload voor nieuwe schema-foto’s
from routers.oefenschema.uploads import upload_schema_image
from routers.oefenschema.path_normalizer import normalize_path

# interne OneDrive copy (A-FLOW)
from onedrive_service import copy_file

router = APIRouter(prefix="/schemas", tags=["Oefenschema"])


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
# TEMPLATEFOTO → SCHEMA MAP (A-FLOW: OneDrive internal copy)
# =====================================================
def copy_existing_to_schema(raw_path: str, schema_id: int, oef_idx: int, slot: int) -> str:
    """
    Kopieert een templatefoto rechtstreeks binnen OneDrive
    naar de map: RevoSport/Oefenschema/Schemas/<schema_id>
    """
    if not raw_path:
        return None

    parent = f"RevoSport/Oefenschema/Schemas/{schema_id}"
    target = f"{parent}/oef_{oef_idx}_foto{slot}.jpg"

    # Interne OneDrive copy — supersnel (A-FLOW)
    copy_file(raw_path, target)

    return target


# =====================================================
# GET: alle schema’s
# =====================================================
from sqlalchemy import func   # <-- BELANGRIJK

@router.get("/")
def list_schemas(db: Session = Depends(get_db)):
    items = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient))
        .order_by(
            func.coalesce(Oefenschema.updated_at, Oefenschema.created_at).desc()
        )
        .all()
    )

    result = []
    for s in items:
        laatste = s.updated_at or s.created_at
        result.append({
            "id": s.id,
            "datum": s.datum.strftime("%Y-%m-%d"),
            "patient_naam": s.patient.naam if s.patient else None,
            "created_by": s.created_by,
            "aantal_oefeningen": len(s.oefeningen),
            "laatst_gewijzigd": laatste.strftime("%Y-%m-%d %H:%M"),
        })

    return result

# =====================================================
# GET: detail schema
# =====================================================
@router.get("/{schema_id}")
def get_schema(schema_id: int, db: Session = Depends(get_db)):
    s = (
        db.query(Oefenschema)
        .options(
            joinedload(Oefenschema.oefeningen),
            joinedload(Oefenschema.patient)
        )
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not s:
        raise HTTPException(404, "Schema niet gevonden")

    return {
        "id": s.id,
        "patient_id": s.patient_id,
        "patient_naam": s.patient.naam if s.patient else None,
        "datum": s.datum,
        "created_by": s.created_by,
        "oefeningen": [
            {
                "id": o.id,
                "template_id": o.template_id,
                "sets": o.sets,
                "reps": o.reps,
                "tempo": o.tempo,
                "gewicht": o.gewicht,
                "opmerking": o.opmerking,
                "volgorde": o.volgorde,
                "foto1": o.foto1,
                "foto2": o.foto2,
            }
            for o in sorted(s.oefeningen, key=lambda x: (x.volgorde or 0))
        ]
    }

# =====================================================
# CREATE SCHEMA
# =====================================================
@router.post("/create")
async def create_schema(
    patient_id: int = Form(...),
    datum: str = Form(...),
    created_by: str = Form("Onbekend"),
    oefeningen_json: str = Form(...),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    schema = Oefenschema(
        patient_id=patient_id,
        datum=date.fromisoformat(datum),
        created_by=created_by,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        pdf_path=None
    )
    db.add(schema)
    db.commit()
    db.refresh(schema)

    schema_id = schema.id
    oefeningen = json.loads(oefeningen_json)

    foto_map = {}

    # Nieuwe foto-upload via upload_schema_image
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

        graph_path = await upload_schema_image(
            schema_id=schema_id,
            oef_index=idx,
            slot=slot,
            file=file
        )
        foto_map[(idx, slot)] = normalize_path(graph_path)

    # Oefeningen opslaan
    for idx, oef in enumerate(oefeningen):

        # Nieuwe uploads?
        f1 = foto_map.get((idx, 1))
        f2 = foto_map.get((idx, 2))

        # Templatefoto kopiëren (A-flow)
        if not f1 and oef.get("foto1"):
            f1 = copy_existing_to_schema(oef["foto1"], schema_id, idx, 1)

        if not f2 and oef.get("foto2"):
            f2 = copy_existing_to_schema(oef["foto2"], schema_id, idx, 2)

        obj = Oefening(
            schema_id=schema_id,
            template_id=oef.get("template_id") or None,
            sets=str(oef.get("sets") or ""),
            reps=str(oef.get("reps") or ""),
            tempo=str(oef.get("tempo") or ""),
            gewicht=str(oef.get("gewicht") or ""),
            opmerking=oef.get("opmerking"),
            volgorde=idx + 1,
            foto1=f1,
            foto2=f2,
        )
        db.add(obj)

    db.commit()

    return {"status": "ok", "id": schema_id}
# =====================================================
# UPDATE SCHEMA
# =====================================================
@router.put("/update/{schema_id}")
async def update_schema(
    schema_id: int,
    patient_id: int = Form(...),
    datum: str = Form(...),
    created_by: str = Form("Onbekend"),
    oefeningen_json: str = Form(...),
    files: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    schema = db.query(Oefenschema).filter(Oefenschema.id == schema_id).first()
    if not schema:
        raise HTTPException(404, "Schema niet gevonden")

    oefeningen_new = json.loads(oefeningen_json)

    oud = {
        o.volgorde: o
        for o in db.query(Oefening)
        .filter(Oefening.schema_id == schema_id)
        .all()
    }

    foto_map = {}

    # Nieuwe uploads
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

        graph_path = await upload_schema_image(
            schema_id=schema_id,
            oef_index=idx,
            slot=slot,
            file=file
        )
        foto_map[(idx, slot)] = normalize_path(graph_path)

    # Oude oefeningen wissen
    db.query(Oefening).filter(Oefening.schema_id == schema_id).delete()

    # Nieuwe opslaan
    for idx, oef in enumerate(oefeningen_new):
        volgorde = idx + 1
        oud_obj = oud.get(volgorde)

        f1 = foto_map.get((idx, 1))
        f2 = foto_map.get((idx, 2))

        # Templatefoto → interne copy
        if not f1:
            if oef.get("foto1") and "Templates/" in str(oef["foto1"]):
                f1 = copy_existing_to_schema(oef["foto1"], schema_id, idx, 1)
            else:
                f1 = oef.get("foto1") or (oud_obj.foto1 if oud_obj else None)

        if not f2:
            if oef.get("foto2") and "Templates/" in str(oef["foto2"]):
                f2 = copy_existing_to_schema(oef["foto2"], schema_id, idx, 2)
            else:
                f2 = oef.get("foto2") or (oud_obj.foto2 if oud_obj else None)

        f1 = normalize_path(f1)
        f2 = normalize_path(f2)

        obj = Oefening(
            schema_id=schema_id,
            template_id=oef.get("template_id") or None,
            sets=str(oef.get("sets") or ""),
            reps=str(oef.get("reps") or ""),
            tempo=str(oef.get("tempo") or ""),
            gewicht=str(oef.get("gewicht") or ""),
            opmerking=oef.get("opmerking"),
            volgorde=volgorde,
            foto1=f1,
            foto2=f2,
        )
        db.add(obj)

    # Schema-meta
    schema.patient_id = patient_id
    schema.datum = date.fromisoformat(datum)
    schema.created_by = created_by
    schema.updated_at = datetime.now()

    db.commit()

    return {"status": "ok", "id": schema_id}

# =====================================================
# DELETE SCHEMA — inclusief OneDrive opruimen
# =====================================================
from onedrive_service import delete_folder_recursive

@router.delete("/{schema_id}")
def delete_schema(schema_id: int, db: Session = Depends(get_db)):
    schema = db.query(Oefenschema).filter(Oefenschema.id == schema_id).first()

    if not schema:
        raise HTTPException(404, "Schema niet gevonden")

    # 1) OneDrive-map wissen
    try:
        folder = f"RevoSport/Oefenschema/Schemas/{schema_id}"
        delete_folder_recursive(folder)
        print(f"🗑️ OneDrive map verwijderd: {folder}")
    except Exception as e:
        print("❌ OneDrive delete error:", e)

    # 2) Oefeningen verwijderen
    db.query(Oefening).filter(Oefening.schema_id == schema_id).delete()

    # 3) Schema verwijderen
    db.delete(schema)
    db.commit()

    return {"status": "deleted", "id": schema_id}

