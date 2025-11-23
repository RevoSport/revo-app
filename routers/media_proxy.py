# =====================================================
# FILE: routers/media_proxy.py
# Revo Sport — OneDrive Proxy (ownerless mode)
# =====================================================

import requests
from fastapi import APIRouter, HTTPException, Response
from datetime import datetime, timedelta
from onedrive_auth import get_access_token
from media_cache import cache_path_for
from routers.oefenschema.path_normalizer import normalize_path


router = APIRouter(prefix="/media", tags=["Media Proxy"])

CACHE_TTL_HOURS = 72   # 3 dagen


@router.get("/file")
def proxy_file(path: str):
    """
    Veilige proxy voor OneDrive bestanden (ownerless mode).
    - Normaliseert ALLE inkomende paden
    - Haalt bestanden op via Graph API
    - Gebruikt lokale cache
    - Geen JWT-auth (frontend <img> werkt zonder headers)
    """
    try:
        # 🔥 1) Path normaliseren
        clean_path = normalize_path(path)

        # 🔥 2) Token ophalen
        token = get_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        # 🔥 3) Ownerless Graph endpoint
        url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean_path}:/content"

        # 🔥 4) Cache path
        cache_file = cache_path_for(clean_path)

        # ---- CACHE CHECK ----
        if cache_file.exists():
            age = datetime.now() - datetime.fromtimestamp(cache_file.stat().st_mtime)
            if age < timedelta(hours=CACHE_TTL_HOURS):
                print(f"⚡ [CACHE] Served from local → {cache_file.name}")
                return Response(
                    content=cache_file.read_bytes(),
                    media_type="image/jpeg"
                )

        # ---- GRAPH FETCH ----
        r = requests.get(url, headers=headers, stream=True, timeout=20)

        if r.status_code != 200:
            raise HTTPException(
                status_code=r.status_code,
                detail=f"Graph error: {r.text}"
            )

        content = r.content

        # ---- CACHE UPDATE ----
        cache_file.write_bytes(content)
        print(f"💾 [CACHE] Updated → {cache_file.name}")

        # ---- RESPOND ----
        return Response(
            content=content,
            media_type=r.headers.get("Content-Type", "application/octet-stream")
        )

    except Exception as e:
        print(f"❌ [MEDIA PROXY] Fout: {e}")
        raise HTTPException(
            status_code=500,
            detail="Proxyfout bij ophalen afbeelding"
        )
