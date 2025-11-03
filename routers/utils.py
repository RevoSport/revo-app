# =====================================================
# FILE: RevoSportAPP/routers/utils.py
# Revo Sport — Logging + Mail via Mediawax SMTP
# =====================================================

from colorama import Fore, Style, init as colorama_init
import os
import smtplib
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

# -----------------------------------------------------
# 🔹 INIT COLOR OUTPUT
# -----------------------------------------------------
colorama_init(autoreset=True)

def ok(msg: str) -> None:
    print(Fore.GREEN + "✅ " + Style.RESET_ALL + msg)

def warn(msg: str) -> None:
    print(Fore.YELLOW + "⚠️  " + Style.RESET_ALL + msg)

def err(msg: str) -> None:
    print(Fore.RED + "❌ " + Style.RESET_ALL + msg)


# =====================================================
#  ENVIRONMENT VARIABELEN LADEN
# =====================================================
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "mail.revosport.be")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "info@revosport.be")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Revo Sport")

# =====================================================
#  MAIL VIA MEDIAWAX SMTP
# =====================================================

def send_mail_mediawax(
    to: str,
    subject: str,
    body: str,
    attachment_name: str = None,
    attachment_bytes: bytes = None,
    cc: str = None,  # ✅ nieuw: optioneel CC-veld
):
    """
    Verstuur e-mail via Mediawax SMTP (mail.revosport.be)
    - Altijd vanuit info@revosport.be
    - Optioneel CC naar therapeut
    - Inclusief PDF-bijlage
    """

    try:
        # ---------------------------------------------
        # 📦 Mail opbouwen
        # ---------------------------------------------
        msg = MIMEMultipart()
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
        msg["To"] = to
        if cc:
            msg["Cc"] = cc
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html", "utf-8"))  # ✅ HTML-mail

        # Voeg bijlage toe indien aanwezig
        if attachment_bytes:
            part = MIMEApplication(attachment_bytes, Name=attachment_name)
            part["Content-Disposition"] = f'attachment; filename="{attachment_name}"'
            msg.attach(part)

        # ---------------------------------------------
        # 📡 Verbinden met Mediawax SMTP
        # ---------------------------------------------
        recipients = [to]
        if cc:
            recipients.append(cc)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, recipients, msg.as_string())

        ok(f"E-mail verzonden naar {to}" + (f" (CC: {cc})" if cc else ""))

    except Exception as e:
        err(f"Fout bij verzenden mail: {e}")
        raise



# =====================================================
#  BACKUP: MAIL VIA MICROSOFT GRAPH (optioneel)
# =====================================================
#  ⚙️  Bewaard als referentie, maar niet meer actief
# =====================================================
"""
import base64
import requests
from onedrive_service import get_access_token, OWNER_UPN

def send_mail_graph(to, cc, subject, body, attachment_name, attachment_bytes):
    print("📧 Versturen e-mail via Microsoft Graph...")

    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    attachment_content = base64.b64encode(attachment_bytes).decode("utf-8")

    message = {
        "message": {
            "subject": subject,
            "body": {"contentType": "Text", "content": body},
            "toRecipients": [{"emailAddress": {"address": to}}],
            "ccRecipients": [{"emailAddress": {"address": cc}}] if cc else [],
            "attachments": [
                {
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": attachment_name,
                    "contentType": "application/pdf",
                    "contentBytes": attachment_content,
                }
            ],
        },
        "saveToSentItems": True,
    }

    url = f"https://graph.microsoft.com/v1.0/users/{OWNER_UPN}/sendMail"
    response = requests.post(url, headers=headers, json=message)

    if response.status_code in (200, 202):
        print("✅ E-mail verzonden naar:", to)
        return {"status": "sent", "to": to, "cc": cc}
    else:
        print("❌ Fout bij verzenden:", response.text)
        raise Exception(f"Graph Mail error: {response.text}")
"""
