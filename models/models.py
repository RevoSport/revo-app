from sqlalchemy import Column, Integer, String, Enum, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(190), unique=True, nullable=False)
    full_name = Column(String(190), nullable=False)
    role = Column(Enum("owner", "therapist"), nullable=False, default="therapist")
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    mfa_secret = Column(String(64))
    created_at = Column(TIMESTAMP, server_default=func.now())
