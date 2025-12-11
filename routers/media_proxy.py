# =====================================================
# FILE: routers/media_proxy.py
# Revo Sport — OneDrive Proxy (ownerless mode)
# =====================================================

import requests
import mimetypes
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
    Veilige proxy:
    - Normaliseert ALLE inkomende paden
    - Haalt bestanden op via Graph API (ownerless mode)
    - Lokale caching (PDF + JPG + PNG + alles)
    - Correcte Content-Type voor PDF rendering
    """
    try:
        # 1) Path normaliseren
        clean_path = normalize_path(path)

        # 2) Cache file path
        cache_file = cache_path_for(clean_path)

        # 3) Cache HIT?
        if cache_file.exists():
            age = datetime.now() - datetime.fromtimestamp(cache_file.stat().st_mtime)
            if age < timedelta(hours=CACHE_TTL_HOURS):
                print(f"⚡ [CACHE] Served from local → {cache_file.name}")

                # Correct mimetype
                content_type, _ = mimetypes.guess_type(clean_path)
                if not content_type:
                    content_type = "application/octet-stream"

                return Response(
                    content=cache_file.read_bytes(),
                    media_type=content_type
                )

        # 4) Graph API ophalen
        token = get_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        url = f"https://graph.microsoft.com/v1.0/drive/root:/{clean_path}:/content"

        print("🌐 [MEDIA PROXY] FETCH")
        print("   → clean_path:", clean_path)
        print("   → url:       ", url)

        r = requests.get(url, headers=headers, stream=True, timeout=20)
        print("   → status:    ", r.status_code)

        if r.status_code != 200:
            print("   → Graph body:", r.text)
            raise HTTPException(r.status_code, f"Graph error: {r.text}")

        content = r.content

        # 5) Cache update
        cache_file.write_bytes(content)
        print(f"💾 [CACHE] Updated → {cache_file.name}")

        # 6) juiste Content-Type bepalen
        content_type, _ = mimetypes.guess_type(clean_path)
        if not content_type:
            content_type = r.headers.get("Content-Type", "application/octet-stream")

        return Response(
            content=content,
            media_type=content_type
        )

    except HTTPException:
        raise

    except Exception as e:
        print("❌ [MEDIA PROXY] Fout:", e)
        raise HTTPException(500, "Proxyfout bij ophalen bestand")
