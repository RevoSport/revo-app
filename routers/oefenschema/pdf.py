# =====================================================
# FILE: routers/oefenschema/pdf.py
# PDF-generatie voor Schema's — FINAL STABLE VERSION
# =====================================================

import io
import os
import requests
from datetime import datetime
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from PIL import Image as PILImage, UnidentifiedImageError

from db import SessionLocal
from models.oefenschema import Oefenschema
from routers.oefenschema.paths import schema_pdf_path
from onedrive_service import upload_bytes

from media_cache import cache_path_for

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
# PATH CLEANER
# =====================================================

def extract_raw_path(url: str | None) -> str | None:
    if not url or url == "null" or url == "None":
        return None

    if "/media/file?path=" in url:
        try:
            return url.split("path=")[1].split("&")[0]
        except:
            return None

    return url


# =====================================================
# UNIFIED SAFE IMAGE LOADER
# =====================================================

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

def load_image_bytes(raw_path: str) -> bytes | None:

    if not raw_path or not isinstance(raw_path, str):
        return None

    cache_p = cache_path_for(raw_path)

    # 1) Cache
    if cache_p.exists():
        try:
            b = cache_p.read_bytes()
            if b and b[:4] != b"<htm":  # voorkom HTML
                return b
        except:
            pass

    # 2) OneDrive-proxy
    try:
        url = f"{API_BASE_URL}/media/file?path={raw_path}"
        r = requests.get(url, timeout=8)

        if r.ok and r.content and not r.content.startswith(b"<html"):
            cache_p.write_bytes(r.content)
            return r.content
    except:
        pass

    # 3) Direct HTTP fallback
    if raw_path.startswith("http://") or raw_path.startswith("https://"):
        try:
            r = requests.get(raw_path, timeout=8)
            if r.ok and r.content and not r.content.startswith(b"<html"):
                cache_p.write_bytes(r.content)
                return r.content
        except:
            pass

    return None


# =====================================================
# PDF BUILDER
# =====================================================

def make_pdf(schema):
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1 * cm,
        rightMargin=1 * cm,
        topMargin=1 * cm,
        bottomMargin=2.0 * cm,
        title=f"Oefenschema – {schema.patient.naam}",
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="RevoTitle", fontSize=16, textColor="#FF7900", alignment=1, spaceAfter=10))
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

    elements.append(Spacer(1, -18))
    elements.append(Paragraph("OEFENSCHEMA", styles["RevoTitle"]))
    elements.append(
        Paragraph(
            f"{schema.patient.naam} — {schema.datum.strftime('%d/%m/%Y')}",
            ParagraphStyle(name="Sub", fontSize=10, textColor="#666666", alignment=1, spaceAfter=20),
        )
    )
    elements.append(Spacer(1, 6))

    # ALWAYS SORT
    oefeningen_sorted = sorted(schema.oefeningen, key=lambda x: x.volgorde or 0)

    for oef in oefeningen_sorted:

        sets = oef.sets or "—"
        reps = oef.reps or "—"
        tempo = oef.tempo or "—"
        gewicht = oef.gewicht or "—"
        opm = oef.opmerking or ""
        volgorde = oef.volgorde or "—"

        foto1 = extract_raw_path(oef.foto1)
        foto2 = extract_raw_path(oef.foto2)

        shared_width = doc.width - 0.5 * cm

        # HEADER TABLE
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
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))

        # FOTO'S
        foto_cells = []
        max_h = 4 * cm

        for f in [foto1, foto2]:

            if not f:
                foto_cells.append(Spacer(1, 0))
                continue

            img_bytes = load_image_bytes(f)

            if not img_bytes:
                foto_cells.append(Spacer(1, 0))
                continue

            # SAFE PIL OPEN
            try:
                pil = PILImage.open(io.BytesIO(img_bytes))
                pil = pil.convert("RGB")
            except Exception:
                foto_cells.append(Spacer(1, 0))
                continue

            pil.thumbnail((1000, max_h))
            out = io.BytesIO()
            pil.save(out, format="JPEG", quality=90)
            out.seek(0)

            img = Image(out)
            foto_cells.append(img)

        fotos = Table([foto_cells], colWidths=[shared_width / 2, shared_width / 2])
        fotos.setStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])

        # OPMERKING
        if opm:
            opm_para = Paragraph(opm, styles["OefText"])
            opm_table = Table([[opm_para]], colWidths=[shared_width - 3 * cm])
            opm_table.setStyle([
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
            ])
        else:
            opm_table = None

        block_content = [t, Spacer(1, 4), fotos]
        if opm_table:
            block_content += [Spacer(1, 4), opm_table]

        block = Table([[block_content]], colWidths=[shared_width])
        block.setStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
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

@router.get("/schema/{schema_id}")
def generate_schema_pdf(schema_id: int, db: Session = Depends(get_db)):
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
        raise HTTPException(404, "Schema niet gevonden")

    try:
        pdf_bytes = make_pdf(schema)
    except Exception as e:
        print("❌ PDF GENERATIE ERROR:", e)
        raise HTTPException(500, "PDF kon niet worden gegenereerd")

    pdf_path = schema_pdf_path(schema)

    # CORRECT ARG ORDER
    upload_bytes(pdf_bytes, pdf_path)

    schema.pdf_path = pdf_path
    schema.updated_at = datetime.now()
    db.add(schema)
    db.commit()

    return {"status": "ok", "path": pdf_path}
