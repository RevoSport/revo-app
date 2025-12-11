# =====================================================
# FILE: routers/oefenschema/mail.py
# Revo Sport — FINAL STABLE MAIL MODULE (PDF + OneDrive Safe)
# =====================================================

import requests
import os

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session, joinedload

from db import SessionLocal
from models.oefenschema import Oefenschema
from routers.oefenschema.paths import schema_pdf_path

from onedrive_auth import get_access_token
from onedrive_service import upload_bytes

from routers.utils import send_mail_mediawax
from routers.oefenschema.pdf import make_pdf
from security import get_current_user


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/mail",
    tags=["Oefenschema Mail"],
)


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
# HTML MAIL TEMPLATE
# =====================================================
def fill_template(patient_naam, therapeut_naam, datum, extra_bericht=None):
    datum_str = datum.strftime("%d/%m/%Y")
    subject = f"Revo Sport – Oefenschema {datum_str}"

    extra_html = (
        f"""
        <p style='font-size:12px; line-height:1.6; margin:0 0 16px 0;'>
            {extra_bericht}
        </p>
        """
        if extra_bericht
        else ""
    )

    html_body = f"""
<!-- ========================= -->
<!--     BODY (12px)           -->
<!-- ========================= -->

<p style="font-size:12px; line-height:1.6; margin:0 0 16px 0;">
  Beste {patient_naam},
</p>

<p style="font-size:12px; line-height:1.6; margin:0 0 16px 0;">
  In bijlage vind je jouw gepersonaliseerd oefenschema met de oefeningen die we samen hebben doorgenomen.
</p>

{extra_html}

<p style="font-size:12px; line-height:1.6; margin:0 0 16px 0;">
  Veel succes met je training! 💪<br>
  Aarzel zeker niet om contact op te nemen bij eventuele vragen of opmerkingen.
</p>

<p style="font-size:12px; line-height:1.6; margin:0 0 22px 0;">
  Sportieve groet,<br>
  <span style="color:#FF7900;">{therapeut_naam}</span>
</p>


<!-- ========================= -->
<!--       FOOTER (10px)       -->
<!-- ========================= -->

<!-- Oranje lijn -->
<div style="height:1px; width:120px; background-color:#FF7900; margin:0 0 8px 0;"></div>

<!-- Web | Mail | Instagram -->
<p style="font-size:10px; line-height:1.4; color:white; margin:0 0 6px 0;">
  <a href="https://www.revosport.be" style="color:#FF7900; text-decoration:none;">www.revosport.be</a> |
  <a href="mailto:info@revosport.be" style="color:#FF7900; text-decoration:none;">info@revosport.be</a> |
  <a href="https://www.instagram.com/revosport.physio/" style="color:#FF7900; text-decoration:none;">Instagram</a>
</p>


<!-- Adressen + telefoons + logo in 1 tabel -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0"
       style="font-size:10px; line-height:1.2; color:white; border-collapse:collapse; margin:0; padding:0;">

  <!-- Rij 1 -->
  <tr>
    <td style="padding:0 16px 0 0; white-space:nowrap;">
      Tramstraat 69 – 9070 Heusden
    </td>
    <td style="color:#FF7900; padding:0 8px; font-weight:bold;">|</td>
    <td style="white-space:nowrap;">
      +32 491 28 20 53
    </td>
  </tr>

  <!-- Rij 2 -->
  <tr>
    <td style="padding:0 16px 2px 0; white-space:nowrap;">
      Zwijnnaardsesteenweg 674 – 9000 Gent
    </td>
    <td style="color:#FF7900; padding:0 8px; font-weight:bold;">|</td>
    <td style="white-space:nowrap; padding-bottom:2px;">
      +32 472 26 51 29
    </td>
  </tr>

  <!-- LOGO — perfect tegen de tekst -->
  <tr>
    <td colspan="3" style="padding:2px 0 0 0; margin:0; line-height:0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0"
             style="margin:0; padding:0; line-height:0; border-collapse:collapse;">
        <tr>
          <td style="padding:8; margin:0; line-height:0;">
            <img src="cid:revosport_logo" width="110"
                 style="display:block; border:0; padding:0; margin:0; line-height:0;">
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
"""

    return subject, html_body


# =====================================================
# SAFE PDF LOADER (OneDrive)
# =====================================================

def load_pdf_bytes(graph_path: str) -> bytes | None:
    """Haalt PDF op van OneDrive. Geeft None bij fout of HTML-response."""
    if not graph_path:
        return None

    token = get_access_token()
    url = f"https://graph.microsoft.com/v1.0/drive/root:/{graph_path}:/content"

    try:
        r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=20)
    except Exception as e:
        print("❌ load_pdf_bytes request error:", e)
        return None

    if not r.ok:
        print(f"❌ load_pdf_bytes status error: {r.status_code}")
        return None

    # Detect HTML errorpagina's (Graph API fout)
    if r.content.startswith(b"<html") or r.content.startswith(b"<!DOCTYPE"):
        print("❌ load_pdf_bytes returned HTML instead of PDF")
        return None

    return r.content


# =====================================================
# MAIL ENDPOINT — ULTRA STABLE VERSION
# =====================================================
@router.post("/{schema_id}")
def mail_schema(
    schema_id: int,
    extra: str | None = Form(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # 1) Schema + patiënt laden
    schema = (
        db.query(Oefenschema)
        .options(
            joinedload(Oefenschema.patient),
            joinedload(Oefenschema.oefeningen),
        )
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not schema:
        raise HTTPException(404, "Schema niet gevonden")

    if not schema.patient or not schema.patient.email:
        raise HTTPException(400, "Patiënt heeft geen geldig e-mailadres")

    # Sorteer oefeningen
    schema.oefeningen = sorted(schema.oefeningen, key=lambda x: x.volgorde or 0)

    # =====================================================
    # 2) PDF ophalen of genereren
    # =====================================================

    pdf_bytes = None

    if schema.pdf_path:
        pdf_bytes = load_pdf_bytes(schema.pdf_path)

    if not pdf_bytes:
        try:
            pdf_bytes = make_pdf(schema)
        except Exception as e:
            print("❌ PDF-fout:", e)
            raise HTTPException(500, "PDF kon niet worden gegenereerd")

        try:
            pdf_path = schema_pdf_path(schema)       # <— OBJECT, niet ID
            upload_bytes(pdf_bytes, pdf_path)
            schema.pdf_path = pdf_path
            db.commit()
        except Exception as e:
            print("❌ OneDrive upload fout:", e)
            raise HTTPException(500, "PDF kon niet worden opgeslagen")

    if not isinstance(pdf_bytes, (bytes, bytearray)) or len(pdf_bytes) < 100:
        print("❌ Ongeldige PDF BYTES")
        raise HTTPException(500, "PDF is ongeldig")

    # =====================================================
    # LOGO LADEN
    # =====================================================
    logo_path = os.path.join("static", "revo_logomail.png")
    logo_bytes = None

    try:
        with open(logo_path, "rb") as f:
            logo_bytes = f.read()
    except Exception as e:
        print("❌ Kon revo_logo.png niet laden:", e)

    # =====================================================
    # 3) MAIL VERSTUREN
    # =====================================================

    therapeut_naam = current_user.full_name or "Revo Sport"
    therapeut_email = current_user.email

    subject, html_body = fill_template(
        patient_naam=schema.patient.naam,
        therapeut_naam=therapeut_naam,
        datum=schema.datum,
        extra_bericht=extra,
    )

    # ✔️ DIT IS DE JUISTE BESTANDSNAAM
    attachment_name = schema.pdf_path.split("/")[-1]

    try:
        send_mail_mediawax(
            to=schema.patient.email,
            subject=subject,
            body=html_body,
            attachment_name=attachment_name,     # <— FIX
            attachment_bytes=pdf_bytes,
            cc=therapeut_email,
            inline_images={"revosport_logo": logo_bytes} if logo_bytes else None,
        )

    except Exception as e:
        print("❌ Mail fout:", e)
        raise HTTPException(500, "E-mail kon niet worden verzonden")

    return {"status": "ok", "message": "Schema verzonden"}

