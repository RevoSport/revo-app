# =====================================================
# FILE: media_cache.py
# Helpers voor media-cache (gedeeld door proxy + upload)
# =====================================================

from pathlib import Path
import os

# -----------------------------
# CACHE MAP
# -----------------------------
CACHE_DIR = Path("cache_media")
CACHE_DIR.mkdir(exist_ok=True)


# -----------------------------
# CACHE PAD GENEREREN
# -----------------------------
def cache_path_for(file_path: str) -> Path:
    clean = file_path.strip("/").replace("%2F", "/")
    safe = clean.replace("/", "_")
    return CACHE_DIR / safe


# -----------------------------
# VERWIJDER SPECIFIEK CACHEBESTAND (main API)
# -----------------------------
def delete_cache_for(file_path: str | None):
    if not file_path:
        return

    p = cache_path_for(file_path)

    if p.exists():
        try:
            p.unlink()
            print(f"🗑️ [CACHE] Verwijderd → {p}")
        except:
            pass


# -----------------------------
# VERWIJDER CACHE VIA OUDE NAAM (fallback)
# -----------------------------
def invalidate_cache(file_path: str):
    """Alias voor backward compatibility."""
    delete_cache_for(file_path)
