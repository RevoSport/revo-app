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
#   ROUTERS
# =====================================================
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
    individueel,
    kinvent,
    media_proxy,
)

from security import get_current_user
from routers.oefenschema.pdf import router as pdf_router
from routers.oefenschema import router as oefenschema_router
from routers.oefenschema.mail import router as mail_router


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
#   CORS
# =====================================================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://aithlete.revosport.be",
    "https://app.revosport.be",
    "https://revosport.vercel.app",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
#   STATIC FILES
# =====================================================
from fastapi.staticfiles import StaticFiles
import os

if not os.path.exists("static"):
    os.makedirs("static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# =====================================================
#   ROUTERS — beveiligd behalve auth
# =====================================================
app.include_router(auth_router.router)  # publiek

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
app.include_router(individueel.router, dependencies=protected)
app.include_router(kinvent.router, dependencies=protected)
app.include_router(media_proxy.router, dependencies=protected)  
app.include_router(oefenschema_router, dependencies=protected)
app.include_router(pdf_router, dependencies=protected)
app.include_router(mail_router, dependencies=protected)



# =====================================================
#   ROOT
# =====================================================
@app.get("/")
def home():
    print(Fore.CYAN + "AI.THLETE" + Style.RESET_ALL)
    return {
        "status": "✅ Revo Sport API v2 running",
        "version": "2.0",
    }

# =====================================================
#   STARTUP MESSAGE
# =====================================================
@app.on_event("startup")
def startup_event():
    print(Fore.GREEN + "WELKOM TERUG." + Style.RESET_ALL)
    print(Fore.CYAN + "🌐 Swagger Docs: (jouw backend URL)/docs" + Style.RESET_ALL)
