# =====================================================
# FILE: main.py
# Revo Sport API v2.0 — Productieversie met CORS-beveiliging
# =====================================================
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from colorama import Fore, Style, init as colorama_init

# =====================================================
# ROUTERS (correcte imports)
# =====================================================
from routers.auth_router import router as auth_router
from routers.patient import router as patient_router
from routers.blessure import router as blessure_router
from routers.baseline import router as baseline_router
from routers.week6 import router as week6_router
from routers.maand3 import router as maand3_router
from routers.maand45 import router as maand45_router
from routers.maand6 import router as maand6_router
from routers.timeline import router as timeline_router
from routers.onedrive_routes import router as onedrive_router
from routers.populatie import router as populatie_router
from routers.metrics import router as metrics_router
from routers.kracht import router as kracht_router
from routers.functioneel import router as functioneel_router
from routers.individueel import router as individueel_router
from routers.kinvent import router as kinvent_router
from routers.media_proxy import router as media_proxy_router
from routers.health import router as health_router

# Oefenschema-bundel
from routers.oefenschema import router as oefenschema_router

# Auth dependency
from security import get_current_user

# =====================================================
# APP CONFIG
# =====================================================
colorama_init(autoreset=True)

app = FastAPI(
    title="Revo Sport Database API",
    version="2.0",
    description="Modulaire FastAPI-structuur met kleur-logging."
)

# =====================================================
# CORS
# =====================================================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://aithlete.revosport.be",
    "https://app.revosport.be",
    "https://revosport.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# STATIC FILES
# =====================================================
from fastapi.staticfiles import StaticFiles

if not os.path.exists("static"):
    os.makedirs("static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# =====================================================
# ROUTERS — beveiligd behalve auth
# =====================================================
app.include_router(auth_router)  # publiek

protected = [Depends(get_current_user)]

# Backoffice modules
app.include_router(patient_router, dependencies=protected)
app.include_router(blessure_router, dependencies=protected)
app.include_router(baseline_router, dependencies=protected)
app.include_router(week6_router, dependencies=protected)
app.include_router(maand3_router, dependencies=protected)
app.include_router(maand45_router, dependencies=protected)
app.include_router(maand6_router, dependencies=protected)
app.include_router(timeline_router, dependencies=protected)
app.include_router(onedrive_router, dependencies=protected)
app.include_router(populatie_router, dependencies=protected)
app.include_router(metrics_router, dependencies=protected)
app.include_router(kracht_router, dependencies=protected)
app.include_router(functioneel_router, dependencies=protected)
app.include_router(individueel_router, dependencies=protected)
app.include_router(kinvent_router, dependencies=protected)
app.include_router(health_router)


# Media proxy
app.include_router(media_proxy_router)

# Oefenschema module
app.include_router(oefenschema_router, dependencies=protected)

# =====================================================
# ROOT
# =====================================================
@app.get("/")
def home():
    print(Fore.CYAN + "AI.THLETE" + Style.RESET_ALL)
    return {
        "status": "✅ Revo Sport API v2 running",
        "version": "2.0",
    }

# =====================================================
# STARTUP MESSAGE
# =====================================================
@app.on_event("startup")
def startup_event():
    print(Fore.GREEN + "WELKOM TERUG." + Style.RESET_ALL)
    print(Fore.CYAN + "🌐 Swagger Docs: (jouw backend URL)/docs" + Style.RESET_ALL)
