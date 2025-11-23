# =====================================================
# FILE: media_cache.py
# Helpers voor media-cache (gedeeld door proxy + upload)
# =====================================================
from pathlib import Path

CACHE_DIR = Path("cache_media")
CACHE_DIR.mkdir(exist_ok=True)

def cache_path_for(file_path: str) -> Path:
    safe = file_path.replace("/", "_")
    return CACHE_DIR / safe

def invalidate_cache(file_path: str):
    p = cache_path_for(file_path)
    if p.exists():
        p.unlink()
        print(f"🗑️ [CACHE] Verwijderd → {p}")
