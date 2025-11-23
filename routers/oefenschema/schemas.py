# =====================================================
# FILE: routers/oefenschema/schemas.py
# CRUD voor Oefenschema + foto uploads (ownerless OneDrive)
# =====================================================

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import json

from db import SessionLocal
from models.oefenschema import Oefenschema, Oefening
from routers.oefenschema.uploads import upload_schema_image

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
# GET: alle schema’s (lightweergave)
# =====================================================

@router.get("/")
def list_schemas(db: Session = Depends(get_db)):
    items = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient))
        .order_by(Oefenschema.updated_at.desc().nullslast())
        .all()
    )

    result = []
    for s in items:
        laatste = s.updated_at or s.created_at
        result.append({
            "id": s.id,
            "patient": s.patient.naam if s.patient else None,
            "datum": s.datum.strftime("%Y-%m-%d"),
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
        .options(joinedload(Oefenschema.oefeningen))
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not s:
        raise HTTPException(404, "Schema niet gevonden")

    return {
        "id": s.id,
        "patient_id": s.patient_id,
        "datum": s.datum,
        "created_by": s.created_by,
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
            for o in sorted(s.oefeningen, key=lambda x: int(x.volgorde or 0))
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
        datum=datum,
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

    # FOTO-UPLOADS
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
        foto_map[(idx, slot)] = graph_path

    # OEFENINGEN OPSLAAN (zero-index → volgorde = idx+1)
    for idx, oef in enumerate(oefeningen):
        obj = Oefening(
            schema_id=schema_id,
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

    # Oud opslaan (op volgorde = 1-based)
    oud = {
        o.volgorde: o
        for o in db.query(Oefening)
        .filter(Oefening.schema_id == schema_id)
        .all()
    }

    foto_map = {}

    # FOTO-UPLOADS (zero-indexed index)
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
        foto_map[(idx, slot)] = graph_path

    # Delete oude oefeningen
    db.query(Oefening).filter(Oefening.schema_id == schema_id).delete()

    # Nieuwe oefeningen opbouwen
    for idx, oef in enumerate(oefeningen_new):     # ZERO-BASED
        volgorde = idx + 1
        oud_obj = oud.get(volgorde)

        f1 = foto_map.get((idx, 1)) or oef.get("foto1") or (oud_obj.foto1 if oud_obj else None)
        f2 = foto_map.get((idx, 2)) or oef.get("foto2") or (oud_obj.foto2 if oud_obj else None)

        obj = Oefening(
            schema_id=schema_id,
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

    schema.patient_id = patient_id
    schema.datum = datum
    schema.created_by = created_by
    schema.updated_at = datetime.now()

    db.commit()

    return {"status": "ok", "id": schema_id}
