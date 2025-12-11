# =====================================================
# FILE: routers/oefenschema/uploads.py
# FINAL STABLE VERSION — Revo Sport
# =====================================================

import io
import os
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from onedrive_service import (
    upload_bytes,
    delete_file_if_exists,
)
from routers.oefenschema.paths import (
    template_image_path,
    schema_image_path,
)


# =====================================================
# IMAGE COMPRESSIE (ULTRA SAFE)
# =====================================================

def compress_image_bytes(data: bytes, max_px=1600, quality=82) -> bytes:
    """
    Converteert ALLES veilig naar JPEG:
    - Detecteert PNG, HEIC, WEBP, corruptie, HTML
    - Failsafe: geen crash, geen corrupte bytes teruggeven
    """
    # HTML of tekst detecteren
    if data.startswith(b"<html") or data.startswith(b"<!DOCTYPE"):
        print("❌ IMAGE ERROR: HTML ontvangen i.p.v. image")
        return None

    try:
        img = Image.open(io.BytesIO(data))
        img = img.convert("RGB")  # forceer JPEG
    except UnidentifiedImageError:
        print("❌ IMAGE ERROR: corrupt of onbekend image-format")
        return None
    except Exception as e:
        print("❌ IMAGE OPEN ERROR:", e)
        return None

    # RESIZE
    w, h = img.size
    longest = max(w, h)

    if longest > max_px:
        scale = max_px / longest
        new_size = (int(w * scale), int(h * scale))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    # SAVE naar JPEG
    out = io.BytesIO()
    try:
        img.save(
            out,
            format="JPEG",
            quality=quality,
            optimize=True,
            progressive=True,
        )
    except Exception as e:
        print("❌ JPEG SAVE ERROR:", e)
        return None

    return out.getvalue()


# =====================================================
# HELPERS
# =====================================================

def timestamped_filename(base: str) -> str:
    ts = str(int(__import__("time").time()))
    return f"{base}_{ts}.jpg"


def clean_old_path(path: str | None) -> str | None:
    """Zorgt dat oude corrupt paths geen crashes veroorzaken."""
    if not path:
        return None
    if isinstance(path, (bytes, bytearray)):
        try:
            return path.decode("utf-8")
        except:
            return None
    return path


# =====================================================
# TEMPLATE FOTO UPLOAD
# =====================================================

async def upload_template_image(
    template_id: int,
    oef_index: int,
    slot: int,
    file: UploadFile,
    old_path: str | None = None,
) -> str:

    raw = await file.read()
    comp = compress_image_bytes(raw)

    if comp is None:
        raise ValueError("Ongeldig of corrupt beeldbestand.")

    base = f"oef_{oef_index}_foto{slot}"
    filename = timestamped_filename(base)
    new_path = template_image_path(template_id, filename)

    # Oude foto verwijderen
    old_clean = clean_old_path(old_path)
    if old_clean:
        delete_file_if_exists(old_clean)

    # Upload correct (content, path)
    upload_bytes(comp, new_path)

    return new_path


# =====================================================
# SCHEMA FOTO UPLOAD
# =====================================================

async def upload_schema_image(
    schema_id: int,
    oef_index: int,
    slot: int,
    file: UploadFile,
    old_path: str | None = None,
) -> str:

    raw = await file.read()
    comp = compress_image_bytes(raw)

    if comp is None:
        raise ValueError("Ongeldig of corrupt beeldbestand.")

    base = f"oef_{oef_index}_foto{slot}"
    filename = timestamped_filename(base)
    new_path = schema_image_path(schema_id, filename)

    old_clean = clean_old_path(old_path)
    if old_clean:
        delete_file_if_exists(old_clean)

    # upload_bytes(content, path)
    upload_bytes(comp, new_path)

    return new_path
