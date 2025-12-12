# =====================================================
# FILE: db.py
# Revo Sport — PostgreSQL (Supabase)
# =====================================================
# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --------------------------------------------------
#   LOAD ENV (.env support lokaal)
# --------------------------------------------------
load_dotenv()

# --------------------------------------------------
#   DATABASE CONFIG (ENV VAR)
# --------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL ontbreekt in environment variables.")

# --------------------------------------------------
#   ENGINE (PostgreSQL)
# --------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # herstelt verbroken connecties
    pool_recycle=300,     # veilig voor pooler
    echo=False,
    future=True,
)

# --------------------------------------------------
#   SESSION EN BASE
# --------------------------------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

# --------------------------------------------------
#   FASTAPI DEPENDENCY
# --------------------------------------------------
def get_db():
    """
    Zorgt ervoor dat elke API-request een eigen database-sessie krijgt.
    De sessie wordt automatisch gesloten na afloop van de request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
