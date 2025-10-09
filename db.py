# db.py
# -*- coding: utf-8 -*-
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --------------------------------------------------
#   .ENV-INSTELLINGEN LADEN
# --------------------------------------------------
load_dotenv()

# Debug: toon actief MySQL-host
print("✅ Verbinden met MySQL host:", os.getenv("MYSQL_HOST"))

# Databasevariabelen uit .env
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DATABASE")

# Controle op ontbrekende waarden
if not all([MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_DB]):
    raise ValueError("❌ Onvolledige databaseconfiguratie in .env-bestand.")

# --------------------------------------------------
#   CONNECTIESTRING & ENGINE
# --------------------------------------------------
DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    "?charset=utf8mb4"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # herstelt automatisch verbroken connecties
    pool_recycle=3600,    # voorkomt MySQL timeouts
    echo=False,           # zet op True voor SQL-debug
    future=True,
)

# --------------------------------------------------
#   SESSION EN BASE
# --------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --------------------------------------------------
#   FASTAPI-DEPENDENCY VOOR DATABASE-SESSION
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

print(f"✅ Verbonden met database: {MYSQL_DB} op host {MYSQL_HOST}")
