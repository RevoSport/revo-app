import re

def normalize_path(path: str | None) -> str | None:
    if not path or not isinstance(path, str):
        return path

    path = path.strip().replace("%2F", "/")

    # Strip leading slashes
    while path.startswith("/"):
        path = path[1:]

    # Fix dubbele nested paden
    path = path.replace("Oefenschema/Oefenschema", "Oefenschema")
    path = path.replace("Templates/Templates", "Templates")

    # =====================================================
    # TEMPLATES
    # =====================================================

    # 1) Nieuwe stijl (correct)
    m = re.search(r"Oefenschema/Templates/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Templates/{m.group(1)}/{m.group(2)}"

    # 2) RevoSport/Templates/{id}/bestanden
    m = re.search(r"RevoSport/Templates/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Templates/{m.group(1)}/{m.group(2)}"

    # 3) Oude Budibase
    m = re.search(r"Templates/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Templates/{m.group(1)}/{m.group(2)}"

    # =====================================================
    # SCHEMAS
    # =====================================================

    # 1) Nieuwe stijl
    m = re.search(r"Oefenschema/Schemas/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Schemas/{m.group(1)}/{m.group(2)}"

    # 2) Oude varianten
    m = re.search(r"RevoSport/Schemas/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Schemas/{m.group(1)}/{m.group(2)}"

    # =====================================================
    # FALLBACK
    # =====================================================
    if not path.startswith("RevoSport/"):
        return f"RevoSport/{path}"

    return path


# =====================================================
# PATH BUILDERS
# =====================================================

def template_image_path(template_id: int, filename: str) -> str:
    return f"RevoSport/Oefenschema/Templates/{template_id}/{filename}"

def template_folder_path(template_id: int) -> str:
    return f"RevoSport/Oefenschema/Templates/{template_id}"

def schema_image_path(schema_id: int, filename: str) -> str:
    return f"RevoSport/Oefenschema/Schemas/{schema_id}/{filename}"

def schema_folder_path(schema_id: int) -> str:
    return f"RevoSport/Oefenschema/Schemas/{schema_id}"


# =====================================================
# DYNAMISCHE PDF BESTANDSNAAM
# =====================================================

def schema_pdf_path(schema) -> str:
    """
    Genereert:
    {Voornaam_Achternaam}_Oefenschema_{YYYY-MM-DD}.pdf
    """
    safe_name = schema.patient.naam.replace(" ", "_")
    date_str = schema.datum.strftime("%Y-%m-%d")

    filename = f"{safe_name}_Oefenschema_{date_str}.pdf"
    return f"RevoSport/Oefenschema/Schemas/{schema.id}/{filename}"
