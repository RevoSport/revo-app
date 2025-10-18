# =====================================================
# FILE: main.py
# Revo Sport API v2.0 — Productieversie met CORS-beveiliging
# =====================================================

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from colorama import Fore, Style, init as colorama_init

# Routers importeren
from routers import (
    auth_router,
    patient,
    blessure,
    baseline,
    week6,
    maand3,
    maand45,
    maand6,
    timeline,
    onedrive_routes,
    populatie,
    metrics,
    kracht, 
    functioneel,
)
from security import get_current_user

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
    description="Modulaire FastAPI-structuur met kleur-logging (productieversie).",
)

# =====================================================
#   CORS MIDDLEWARE (Frontend-toegang)
# =====================================================
origins = [
    "http://localhost:3000",          # lokaal (React)
    "http://localhost:5173",          # lokaal (Vite)
    "https://aithlete.revosport.be",  # NIEUWE frontend
    "https://app.revosport.be",       # oude frontend
    "https://*.vercel.app",           # preview builds
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
# Publieke router (login)
app.include_router(auth_router.router)

# Alle andere routes vereisen login
protected = [Depends(get_current_user)]

app.include_router(patient.router, dependencies=protected)
app.include_router(blessure.router, dependencies=protected)
app.include_router(baseline.router, dependencies=protected)
app.include_router(week6.router, dependencies=protected)
app.include_router(maand3.router, dependencies=protected)
app.include_router(maand45.router, dependencies=protected)
app.include_router(maand6.router, dependencies=protected)
app.include_router(timeline.router, dependencies=protected)
app.include_router(onedrive_routes.router, dependencies=protected)
app.include_router(populatie.router, dependencies=protected)
app.include_router(metrics.router, dependencies=protected)
app.include_router(kracht.router, dependencies=protected)  
app.include_router(functioneel.router, dependencies=protected)

# =====================================================
#   ROOT ENDPOINT
# =====================================================
@app.get("/")
def home():
    print(Fore.CYAN + "AI.THLETE" + Style.RESET_ALL)
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
            "/upload_dynamic",
            "/populatie",
            "/metrics",
            "/kracht",  # ✅ toegevoegd aan overzicht
        ],
    }

# =====================================================
#   STARTUP MESSAGE
# =====================================================
@app.on_event("startup")
def startup_event():
    print(Fore.GREEN + "WELKOM TERUG." + Style.RESET_ALL)
    print(
        Fore.YELLOW
        + "📂 Routers geladen: patients, blessures, baseline, week6, maand3, maand45, maand6, timeline, onedrive_routes, populatie, metrics, kracht"
        + Style.RESET_ALL
    )
    print(Fore.CYAN + "🌐 Swagger Docs: https://revo-backend-5dji.onrender.com/docs" + Style.RESET_ALL)
    print(Fore.MAGENTA + "💡 Tip: kleur-logs verschijnen bij elke CRUD-actie in de terminal." + Style.RESET_ALL)
