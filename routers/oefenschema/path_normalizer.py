# =====================================================
# FILE: routers/oefenschema/path_normalizer.py
# Centrale normalisatie voor ALLE Template- en Schema-paden
# =====================================================

import re

def normalize_path(path: str | None) -> str | None:
    if not path or not isinstance(path, str):
        return path

    # Cleanup
    path = path.strip().replace("%2F", "/")

    # Leading "/"
    while path.startswith("/"):
        path = path[1:]

    # Fix dubbele nested paden
    path = path.replace("Oefenschema/Oefenschema", "Oefenschema")
    path = path.replace("Templates/Templates", "Templates")

    # =====================================================
    # TEMPLATES
    # =====================================================

    # 1) Correct nieuwe stijl
    m = re.search(r"Oefenschema/Templates/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Templates/{m.group(1)}/{m.group(2)}"

    # 2) Oude variant: RevoSport/Templates/{id}/bestanden
    m = re.search(r"RevoSport/Templates/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Templates/{m.group(1)}/{m.group(2)}"

    # 3) Budibase-template variant: Templates/{id}/bestanden
    m = re.search(r"Templates/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Templates/{m.group(1)}/{m.group(2)}"


    # =====================================================
    # SCHEMAS
    # =====================================================

    # 1) Nieuwe stijl (correct)
    m = re.search(r"Oefenschema/Schemas/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Schemas/{m.group(1)}/{m.group(2)}"

    # 2) Oude variant: RevoSport/Schemas/{id}/...
    m = re.search(r"RevoSport/Schemas/(\d+)/(.+)", path)
    if m:
        return f"RevoSport/Oefenschema/Schemas/{m.group(1)}/{m.group(2)}"


    # =====================================================
    # FALLBACK
    # =====================================================
    if not path.startswith("RevoSport/"):
        return f"RevoSport/{path}"

    return path
