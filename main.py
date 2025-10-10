# =====================================================
# FILE: main.py
# Revo Sport API v2.0 — Productieversie met CORS-beveiliging
# =====================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from colorama import Fore, Style, init as colorama_init
from routers import onedrive_routes

# =====================================================
#   Router-imports (lokaal)
# =====================================================
from routers import (
    patient,
    blessure,
    baseline,
    week6,
    maand3,
    maand45,
    maand6,
    timeline
)

# =====================================================
#   Kleur initialisatie
# =====================================================
colorama_init(autoreset=True)

# =====================================================
#   APP CONFIG
# =====================================================
app = FastAPI(
    title="Revo Sport Database API",
    version="2.0",
    description="Modulaire FastAPI-structuur met kleur-logging (productieversie)."
)

# =====================================================
#   CORS MIDDLEWARE (Frontend-toegang)
# =====================================================
origins = [
    "http://localhost:3000",                # lokaal
    "https://*.vercel.app",                 # alle preview builds op Vercel
    "https://app.revosport.be"              # je eigen domein
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
#   ROUTERS REGISTREREN
# =====================================================
app.include_router(patient.router)
app.include_router(blessure.router)
app.include_router(baseline.router)
app.include_router(week6.router)
app.include_router(maand3.router)
app.include_router(maand45.router)
app.include_router(maand6.router)
app.include_router(timeline.router)
app.include_router(onedrive_routes.router)

# =====================================================
#   ROOT ENDPOINT
# =====================================================
@app.get("/")
def home():
    print(Fore.CYAN + "🚀 Revo Sport API v2 gestart" + Style.RESET_ALL)
    return {
        "status": "✅ Revo Sport API v2 running",
        "version": "2.0",
        "routers": [
            "/patients",
            "/blessures",
            "/baseline",
            "/week6",
            "/maand3",
            "/maand45",
            "/maand6",
            "/timeline",
            "/upload_dynamic"
        ],
    }

# =====================================================
#   STARTUP MESSAGE
# =====================================================
@app.on_event("startup")
def startup_event():
    print(Fore.GREEN + "✅ FastAPI app gestart - Revo Sport API v2 actief" + Style.RESET_ALL)
    print(Fore.YELLOW + "📂 Routers geladen: patients, blessures, baseline, week6, maand3, maand45, maand6, timeline, onedrive_routes" + Style.RESET_ALL)
    print(Fore.CYAN + "🌐 Swagger Docs: https://revo-backend-5dji.onrender.com/docs" + Style.RESET_ALL)
    print(Fore.MAGENTA + "💡 Tip: kleur-logs verschijnen bij elke CRUD-actie in de terminal." + Style.RESET_ALL)
