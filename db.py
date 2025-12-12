# =====================================================
# FILE: db.py
# Revo Sport — MySQL (single source of truth)
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
#   DATABASE CONFIG (MySQL via losse vars)
# --------------------------------------------------
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

missing = [k for k, v in {
    "DB_HOST": DB_HOST,
    "DB_USER": DB_USER,
    "DB_PASSWORD": DB_PASSWORD,
    "DB_NAME": DB_NAME,
}.items() if not v]

if missing:
    raise ValueError(f"❌ Missing DB env vars: {', '.join(missing)}")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# --------------------------------------------------
#   ENGINE (MySQL)
# --------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
