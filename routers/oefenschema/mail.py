# =====================================================
# FILE: routers/oefenschema/mail.py
# Versturen van schema- en template-PDF per mail (MediaWax)
# =====================================================

import requests
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session, joinedload

from db import SessionLocal
from models.oefenschema import Oefenschema
from routers.oefenschema.paths import schema_pdf_path
from onedrive_auth import get_access_token
from routers.utils import send_mail_mediawax
from security import get_current_user


router = APIRouter(
    prefix="/oefenschema/mail",
    tags=["Oefenschema Mail"]
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
# HTML MAIL TEMPLATE (Revo Sport)
# =====================================================

def fill_template(patient_naam: str, therapeut_naam: str, datum, extra_bericht: str | None = None):
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

      <p>
        Veel succes met je training! 💪<br>
        Aarzel zeker niet om contact op te nemen bij eventuele vragen of opmerkingen.
      </p>

      <br>

      <p style="margin-bottom:4px;">Sportieve groet,</p>
      <p style="margin:0;color:#FF7900;">{therapeut_naam}</p>

      <hr style="border:none;border-top:1px solid #FF7900;margin:16px 0;width:150px;text-align:left;">

      <table style="font-size:13px;border-collapse:collapse;">
        <tr>
          <td colspan="3" style="padding-bottom:4px;">
            <a href="https://www.revosport.be" style="color:#FF7900;text-decoration:none;">www.revosport.be</a> |
            <a href="mailto:info@revosport.be" style="color:#FF7900;text-decoration:none;">info@revosport.be</a> |
            <a href="https://www.instagram.com/revosport.physio/" style="color:#FF7900;text-decoration:none;">Instagram</a>
          </td>
        </tr>
        <tr>
          <td>Tramstraat 69 - 9070 Heusden</td>
          <td style="color:#FF7900;">|</td>
          <td>+32 491 28 20 53</td>
        </tr>
        <tr>
          <td>Zwijnaardsesteenweg 674 - 9000 Gent</td>
          <td style="color:#FF7900;">|</td>
          <td>+32 472 26 51 29</td>
        </tr>
      </table>

      <div style="text-align:left;margin-top:10px;">
        <img src="https://www.revosport.be/wp-content/uploads/2025/11/LOGORevo-e1762015461505.png" width="120">
      </div>

    </body>
    </html>
    """

    return subject, html


# =====================================================
# HELPER: PDF BYTES LADEN VIA GRAPH (interne link)
# =====================================================

def load_pdf_bytes(graph_path: str) -> bytes:
    token = get_access_token()

    url = f"https://graph.microsoft.com/v1.0/drive/root:/{graph_path}:/content"

    r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=30)

    if r.status_code != 200:
        raise HTTPException(
            500,
            f"PDF kon niet worden opgehaald via OneDrive ({r.status_code})"
        )

    return r.content

# =====================================================
# MAIL: SCHEMA → Patiënt (CC = ingelogde therapeut)
# =====================================================

@router.post("/{schema_id}")
def mail_schema(
    schema_id: int,
    extra: str | None = Form(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schema = (
        db.query(Oefenschema)
        .options(joinedload(Oefenschema.patient))
        .filter(Oefenschema.id == schema_id)
        .first()
    )

    if not schema:
        raise HTTPException(404, "Schema niet gevonden")

    if not schema.patient:
        raise HTTPException(400, "Schema heeft geen patiënt gekoppeld")

    if not schema.patient.email:
        raise HTTPException(400, "Patiënt heeft geen e-mailadres")

    if not schema.pdf_path:
        raise HTTPException(400, "Geen PDF beschikbaar voor dit schema")

    # PDF laden
    pdf_bytes = load_pdf_bytes(schema.pdf_path)

    # therapeut = ingelogde user
    therapeut_naam = current_user.full_name or "Revo Sport"
    therapeut_email = current_user.email

    # mailtemplate bouwen
    subject, html_body = fill_template(
        patient_naam=schema.patient.naam,
        therapeut_naam=therapeut_naam,
        datum=schema.datum,
        extra_bericht=extra
    )

    # versturen
    send_mail_mediawax(
        to=schema.patient.email,
        subject=subject,
        body=html_body,
        attachment_name="oefenschema.pdf",
        attachment_bytes=pdf_bytes,
        cc=therapeut_email
    )

    return {"status": "ok", "message": "Schema verzonden"}



