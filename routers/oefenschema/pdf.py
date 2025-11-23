# =====================================================
# FILE: routers/oefenschema/pdf.py
# PDF-generatie voor Schema's — oude layout (met grijze kaders)
# =====================================================

import io
import os
import requests
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from PIL import Image as PILImage

from db import SessionLocal
from models.oefenschema import Oefenschema, Oefening
from routers.oefenschema.paths import schema_pdf_path
from onedrive_service import upload_bytes

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/pdf", tags=["Oefenschema PDF"])


# =====================================================
# DB
# =====================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# MEDIA LOADER
# =====================================================

MEDIA_PROXY_BASE = os.getenv("API_INTERNAL_BASE_URL", "http://localhost:8000")

def load_image_bytes(internal_path: str) -> bytes | None:
    if not internal_path:
        return None

    try:
        r = requests.get(
            f"{MEDIA_PROXY_BASE}/media/file",
            params={"path": internal_path},
            timeout=20
        )

        if r.status_code != 200:
            return None

        data = r.content
        if not data or data.startswith(b"<html"):
            return None

        return data

    except:
        return None


# =====================================================
# HOOFD: Oude Layout Generator
# =====================================================

def make_pdf(schema):
    import re
    buffer = BytesIO()

    # DOCUMENT
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1 * cm,
        rightMargin=1 * cm,
        topMargin=1 * cm,
        bottomMargin=2.0 * cm,
        title=f"Oefenschema – {schema.patient.naam}",
    )

    # STIJLEN
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="RevoTitle", fontSize=16, textColor="#FF7900", alignment=1, spaceAfter=10))
    styles.add(ParagraphStyle(name="OefNaam", fontSize=12, textColor="#FF7900", spaceAfter=4, leading=14))
    styles.add(ParagraphStyle(name="OefText", fontSize=10, textColor="#333333", leading=13))

    elements = []

    # LOGO
    try:
        logo = Image("static/revo_logo.png", width=120, height=120)
        logo.hAlign = "CENTER"
        elements.append(Spacer(0, -40))
        elements.append(logo)
    except:
        elements.append(Paragraph("<b>REVO SPORT</b>", styles["RevoTitle"]))

    # TITLE + META
    elements.append(Spacer(1, -18))
    elements.append(Paragraph("OEFENSCHEMA", styles["RevoTitle"]))
    elements.append(
        Paragraph(
            f"{schema.patient.naam} — {schema.datum.strftime('%d/%m/%Y')}",
            ParagraphStyle(name="Sub", fontSize=10, textColor="#666666", alignment=1, spaceAfter=20),
        )
    )
    elements.append(Spacer(1, 6))

    # OEFENINGEN SORTEREN
    oefeningen_sorted = sorted(schema.oefeningen, key=lambda x: getattr(x, "volgorde", ""))

    def hoofdgroep(volgorde_str):
        m = re.match(r"^(\d+)", volgorde_str or "")
        return int(m.group(1)) if m else None

    # OEFENINGBLOKKEN
    for i, oef in enumerate(oefeningen_sorted):
        naam = getattr(oef, "naam", "—")
        sets = oef.sets or "—"
        reps = oef.reps or "—"
        tempo = oef.tempo or "—"
        gewicht = oef.gewicht or "—"
        opm = oef.opmerking or ""
        foto1 = getattr(oef, "foto1", None)
        foto2 = getattr(oef, "foto2", None)
        volgorde = getattr(oef, "volgorde", "—") or "—"

        shared_width = doc.width - 0.5 * cm

        # ORANJE TABEL (maar jij gebruikte grijs!)
        data = [["#", "Sets", "Reps", "Tempo", "Gewicht"], [str(volgorde), sets, reps, tempo, gewicht]]
        t = Table(
            data,
            colWidths=[
                shared_width * 0.10,
                shared_width * 0.22,
                shared_width * 0.22,
                shared_width * 0.23,
                shared_width * 0.23,
            ],
        )
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ]))

        # TITEL (boven foto’s)
        titel_para = Paragraph(f"<b>{naam}</b>", styles["OefNaam"])
        titel_table = Table([[titel_para]], colWidths=[shared_width - 3 * cm])
        titel_table.setStyle([
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])

        # FOTO’S LADEN
        foto_cellen = []
        max_h = 4 * cm

        for f in [foto1, foto2]:
            if not f:
                foto_cellen.append(Spacer(1, 0))
                continue

            img_bytes = load_image_bytes(f)
            if not img_bytes:
                foto_cellen.append(Spacer(1, 0))
                continue

            pil = PILImage.open(io.BytesIO(img_bytes))
            pil = pil.convert("RGB")
            pil.thumbnail((1000, max_h))
            out = io.BytesIO()
            pil.save(out, format="JPEG", quality=90)
            out.seek(0)

            img = Image(out)
            foto_cellen.append(img)

        fotos = Table([foto_cellen], colWidths=[shared_width / 2, shared_width / 2])

        # OPMERKING
        opm_table = None
        if opm:
            opm_para = Paragraph(opm, styles["OefText"])
            opm_table = Table([[opm_para]], colWidths=[shared_width - 3 * cm])
            opm_table.setStyle([
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ])

        # KADER (oude stijl)
        block_content = [t, Spacer(1, 4), titel_table, fotos]
        if opm_table:
            block_content += [Spacer(1, 4), opm_table]

        block = Table([[block_content]], colWidths=[shared_width])
        block.setStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.lightgrey),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 25),
        ])

        elements.append(block)
        elements.append(Spacer(1, 20))

    # FOOTER
    def add_footer(canvas, doc):
        canvas.saveState()
        width, height = A4
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#888888"))
        canvas.drawCentredString(width / 2, 1 * cm, "BOUNCE BACK. LEVEL UP. STAY STRONG.  |  REVO SPORT")
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_footer, onLaterPages=add_footer)

    return buffer.getvalue()


# =====================================================
# ROUTE
# =====================================================

@router.post("/schema/{schema_id}")
def generate_schema_pdf(schema_id: int, db: Session = Depends(get_db)):
    schema = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient), joinedload(Oefenschema.oefeningen))
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not schema:
        raise HTTPException(404, "Schema niet gevonden")

    pdf_bytes = make_pdf(schema)

    pdf_path = schema_pdf_path(schema_id)
    upload_bytes(pdf_path, pdf_bytes, content_type="application/pdf")

    schema.pdf_path = pdf_path
    schema.updated_at = datetime.now()
    db.add(schema)
    db.commit()

    return {"status": "ok", "path": pdf_path}
