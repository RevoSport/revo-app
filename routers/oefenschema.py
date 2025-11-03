# =====================================================
# FILE: routers/oefenschema.py
# Revo Sport — Oefenschema-module + PDF + Mail
# =====================================================

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

from db import SessionLocal
from models.oefenschema import PatientOefen, Oefenschema, Oefening, TemplateOefen
from schemas.oefenschema import (
    PatientCreate, PatientSchema,
    OefenschemaCreate, OefenschemaSchema,
    TemplateBase, TemplateSchema,
    OefenschemaPDFRequest
)
from onedrive_service import upload_to_onedrive_bytes
from routers.utils import send_mail_mediawax

router = APIRouter(prefix="/oefenschema", tags=["Oefenschema"])

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
# 🔹 PATIËNTEN
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
# 🔹 SCHEMA’S
# =====================================================
@router.post("/", response_model=OefenschemaSchema)
def create_schema(data: OefenschemaCreate, db: Session = Depends(get_db)):
    schema = Oefenschema(
        patient_id=data.patient_id,
        datum=data.datum,
        titel=data.titel,
        opmerkingen=data.opmerkingen,
        created_by=data.created_by,
    )
    db.add(schema)
    db.commit()
    db.refresh(schema)

    for oef in data.oefeningen:
        oef_obj = Oefening(**oef.dict(), schema_id=schema.id)
        db.add(oef_obj)
    db.commit()
    db.refresh(schema)
    return schema


@router.get("/", response_model=list[OefenschemaSchema])
def list_schemas(db: Session = Depends(get_db)):
    return (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient), joinedload(Oefenschema.oefeningen))
        .order_by(Oefenschema.updated_at.desc())
        .all()
    )


@router.get("/{schema_id}", response_model=OefenschemaSchema)
def get_schema(schema_id: int, db: Session = Depends(get_db)):
    schema = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.oefeningen))
        .filter(Oefenschema.id == schema_id)
        .first()
    )
    if not schema:
        raise HTTPException(status_code=404, detail="Schema niet gevonden")
    return schema


# =====================================================
# 🔹 TEMPLATES
# =====================================================
@router.post("/template", response_model=TemplateSchema)
def create_template(data: TemplateBase, db: Session = Depends(get_db)):
    template = TemplateOefen(**data.dict())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/template", response_model=list[TemplateSchema])
def list_templates(db: Session = Depends(get_db)):
    return db.query(TemplateOefen).order_by(TemplateOefen.created_at.desc()).all()


# =====================================================
# 🔹 MAIL TEMPLATE
# =====================================================
def fill_template(patient_naam: str, therapeut_naam: str, datum, extra_bericht: str = None):
    datum_str = datum.strftime("%d/%m/%Y")
    subject = f"Revo Sport – Oefenschema {datum_str}"

    extra_text = f"<p>{extra_bericht}</p>" if extra_bericht else ""

    html = f"""
    <html>
    <body style="font-family:Arial,sans-serif;background-color:#fff;color:#111;line-height:1.6;padding:20px;">
      <p>Beste {patient_naam},</p>
      <p>In bijlage vind je jouw gepersonaliseerd oefenschema met de oefeningen die we samen hebben doorgenomen.</p>
      {extra_text}
      <br>
      <p>Veel succes met je training! 💪<br>
      Aarzel zeker niet om contact op te nemen bij eventuele vragen of opmerkingen.</p>
      <br>
      <p style="margin-bottom:4px;">Sportieve groet,</p>
      <p style="margin:0;color:#FF7900;">{therapeut_naam}</p>
      <hr style="border:none;border-top:1px solid #FF7900;margin:16px 0;width:150px;text-align:left;">
      <table style="font-size:13px;border-collapse:collapse;">
        <tr><td colspan="3" style="padding-bottom:4px;">
          <a href="https://www.revosport.be" style="color:#FF7900;text-decoration:none;">www.revosport.be</a> |
          <a href="mailto:info@revosport.be" style="color:#FF7900;text-decoration:none;">info@revosport.be</a> |
          <a href="https://www.instagram.com/revosport.physio/" style="color:#FF7900;text-decoration:none;">Instagram</a>
        </td></tr>
        <tr><td>Tramstraat 69 - 9070 Heusden</td><td style="color:#FF7900;">|</td><td>+32 491 28 20 53</td></tr>
        <tr><td>Zwijnaardsesteenweg 674 - 9000 Gent</td><td style="color:#FF7900;">|</td><td>+32 472 26 51 29</td></tr>
      </table>
      <div style="text-align:left;margin-top:10px;">
        <img src="https://www.revosport.be/wp-content/uploads/2025/11/LOGORevo-e1762015461505.png" width="120">
      </div>
    </body>
    </html>
    """
    return subject, html


# =====================================================
# 🔹 Revo Sport — PDF layout met header + footer
# =====================================================
def make_pdf(schema):
    import re
    buffer = BytesIO()

    # 🔸 Document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1 * cm,
        rightMargin=1 * cm,
        topMargin=1 * cm,
        bottomMargin=2.0 * cm,
        title=f"Oefenschema – {schema.patient.naam}",
    )

    # 🔸 Stijlen
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="RevoTitle", fontSize=16, textColor="#FF7900", alignment=1, spaceAfter=10))
    styles.add(ParagraphStyle(name="OefNaam", fontSize=12, textColor="#FF7900", spaceAfter=4, leading=14))
    styles.add(ParagraphStyle(name="OefText", fontSize=10, textColor="#333333", leading=13))

    elements = []

    # =====================================================
    # 🔹 LOGO + TITEL
    # =====================================================
    try:
        from reportlab.lib.utils import ImageReader
        logo_reader = ImageReader("static/revo_logo.png")
        iw, ih = logo_reader.getSize()
        aspect = ih / float(iw)
        logo = Image("static/revo_logo.png", width=120, height=120 * aspect)
        logo.hAlign = "CENTER"
        elements.append(Spacer(0, -40))
        elements.append(logo)
    except Exception:
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

    # =====================================================
    # 🔹 OEFENINGEN
    # =====================================================
    oefeningen_sorted = sorted(schema.oefeningen, key=lambda x: getattr(x, "volgorde", ""))

    def hoofdgroep(volgorde_str):
        m = re.match(r"^(\d+)", volgorde_str or "")
        return int(m.group(1)) if m else None

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

        # =====================================================
        # 🟧 ORANJE BALK
        # =====================================================
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
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))

        # =====================================================
        # 🏷️ TITEL (boven foto's)
        # =====================================================
        titel_para = Paragraph(f"<b>{naam}</b>", styles["OefNaam"])
        titel_table = Table(
            [[titel_para]],
            colWidths=[shared_width - 3 * cm],
            style=[
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ],
        )

        # =====================================================
        # 📸 FOTO’S
        # =====================================================
        foto_cellen = []
        for path in [foto1, foto2]:
            if path:
                try:
                    img = Image(path)
                    iw, ih = img.wrap(0, 0)
                    aspect = iw / ih if ih != 0 else 1
                    new_height = 4 * cm
                    new_width = new_height * aspect
                    img._restrictSize(new_width, new_height)
                    foto_cellen.append(img)
                except Exception:
                    foto_cellen.append(Paragraph("(Ongeldige foto)", styles["OefText"]))
            else:
                foto_cellen.append(Spacer(1, 0))

        fotos = None
        if foto1 or foto2:
            fotos = Table([foto_cellen], colWidths=[shared_width / 2, shared_width / 2])
            fotos.setStyle(TableStyle([
                ("ALIGN", (0, 0), (0, -1), "LEFT"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]))

        # =====================================================
        # 📝 OPMERKING (onder foto's)
        # =====================================================
        opm_table = None
        if opm:
            opm_para = Paragraph(opm, styles["OefText"])
            opm_table = Table(
                [[opm_para]],
                colWidths=[shared_width - 3 * cm],
                style=[
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                ],
            )

        # =====================================================
        # 🔲 KADER MET ALLES
        # =====================================================
        block_content = [t, Spacer(1, 4), titel_table]
        if fotos:
            block_content += [fotos]
        if opm_table:
            block_content += [Spacer(1, 4), opm_table]

        bottom_padding = 25 if fotos else 12

        block = Table([[block_content]], colWidths=[shared_width], style=[
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.lightgrey),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), bottom_padding),
        ])
        elements.append(block)

        # Alleen extra witruimte tussen hoofdgroepen
        huidig = hoofdgroep(volgorde)
        volgend = hoofdgroep(getattr(oefeningen_sorted[i + 1], "volgorde", "")) if i < len(oefeningen_sorted) - 1 else None
        if volgend is None or huidig != volgend:
            elements.append(Spacer(1, 20))

    # =====================================================
    # 🔹 FOOTER + EXTRA RUIMTE OP VOLGENDE PAGINA'S
    # =====================================================

    def add_footer(canvas, doc):
        canvas.saveState()
        width, height = A4
        footer_y = 1.3 * cm
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#888888"))
        canvas.drawCentredString(
            width / 2.0,
            footer_y,
            "BOUNCE BACK. LEVEL UP. STAY STRONG.  |  REVO SPORT",
        )
        canvas.restoreState()

    # =====================================================
    # 🔹 PDF OPBOUW
    # =====================================================
    doc.build(
        elements,
        onFirstPage=add_footer,
        onLaterPages=add_footer,
    )

    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


# =====================================================
# 🔹 FOTO-UPLOAD PER OEFENING
# =====================================================
from fastapi import UploadFile, File

@router.post("/upload-foto/{oefening_id}")
async def upload_foto(
    oefening_id: int,
    foto: UploadFile = File(...),
    slot: int = 1,
    db: Session = Depends(get_db),
):
    """
    Upload een foto voor een specifieke oefening.
    Wordt gebruikt na het opslaan van het oefenschema.
    """
    oef = db.query(Oefening).filter(Oefening.id == oefening_id).first()
    if not oef:
        raise HTTPException(status_code=404, detail="Oefening niet gevonden")

    content = await foto.read()
    file_url = upload_to_onedrive_bytes(content, foto.filename)

    # 🔸 Bepaal welke kolom geüpdatet wordt
    if slot == 2:
        oef.foto2 = file_url
    else:
        oef.foto1 = file_url

    db.commit()
    return {"url": file_url}


# =====================================================
# 🔹 TEST ENDPOINT — PDF preview
# =====================================================
@router.get("/pdf/view", include_in_schema=True)
def oefenschema_pdf_test(skip_auth: bool = Depends(lambda: True)):
    class DummyPatient:
        naam = "Test Patiënt"

    class DummyOefening:
        def __init__(self, naam, sets, reps, tempo, gewicht, opm, volgorde, f1=None, f2=None):
            self.naam = naam
            self.sets = sets
            self.reps = reps
            self.tempo = tempo
            self.gewicht = gewicht
            self.opmerking = opm
            self.foto1 = f1
            self.foto2 = f2
            self.volgorde = volgorde

    class DummySchema:
        patient = DummyPatient()
        datum = datetime.now()
        oefeningen = [
            # 🔸 Hoofdgroep 1
            DummyOefening("Squat", 3, 10, "2-0-1", "60kg", "Focus op rechte rug en knieën niet voorbij tenen.", "1a", "static/example1.jpg", "static/example2.jpg"),
            DummyOefening("Split Squat", 3, 8, "3-0-1", "Bodyweight", "", "1b", "static/example1.jpg", None),

            # 🔸 Hoofdgroep 2 — mix met en zonder foto’s
            DummyOefening("Hamstring Curl", 3, 12, "3-0-2", "20kg", "Langzame excentrische fase, hou spanning constant.", "2a", "static/example1.jpg", None),
            DummyOefening("Nordic Hamstring", 2, 6, "4-0-0", "—", "Gebruik partner of enkelhaak.", "2b", None, None),

            # 🔸 Hoofdgroep 3 — zonder opmerkingen
            DummyOefening("Step-Up", 3, 12, "2-0-1", "Bodyweight", "", "3a", "static/example2.jpg", None),
            DummyOefening("Lunges", 2, 10, "2-0-2", "—", "", "3b", None, None),

            # 🔸 Hoofdgroep 4 — enkel foto’s, geen tekst
            DummyOefening("Single Leg Bridge", 3, 15, "2-0-1", "—", "", "4", "static/example1.jpg", "static/example2.jpg"),

            # 🔸 Hoofdgroep 5 — lange opmerkingstekst
            DummyOefening(
                "Core Rotation Cable",
                3,
                10,
                "3-1-1",
                "15kg",
                "Beweeg gecontroleerd. Start in neutrale positie, span de buik aan en roteer langzaam zonder de heupen te draaien. Adem uit bij het trekken en houd spanning gedurende de volledige rotatie.",
                "5a",
                "static/example1.jpg",
                None,
            ),
            DummyOefening(
                "Side Plank with Hip Dip",
                2,
                12,
                "3-0-3",
                "—",
                "Zorg voor rechte lijn tussen schouders, heup en enkels.",
                "5b",
                None,
                None,
            ),

            # 🔸 Hoofdgroep 6 — zonder foto’s en met korte notitie
            DummyOefening("Calf Raises", 3, 20, "1-0-1", "Bodyweight", "Hou spanning bovenaan 1 sec.", "6", None, None),
        ]

    pdf_bytes = make_pdf(DummySchema())
    return Response(content=pdf_bytes, media_type="application/pdf")
