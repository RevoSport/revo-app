# =====================================================
# FILE: security.py
# Revo Sport - centrale beveiligingsfuncties (JWT + hashing)
# =====================================================

import os
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

from db import get_db
from models import User

# -----------------------------------------------------
# .ENV LADEN
# -----------------------------------------------------
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# -----------------------------------------------------
# TOKEN SCHEMA
# -----------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# -----------------------------------------------------
# PASSWORD HASHING
# -----------------------------------------------------
def hash_password(plain: str) -> str:
    """
    Maak een bcrypt-hash van een plaintext wachtwoord.
    Bcrypt ondersteunt maximaal 72 bytes → we truncaten dit uit veiligheidsoverweging.
    """
    if not isinstance(plain, str):
        raise ValueError("Wachtwoord moet een string zijn.")
    plain = plain[:72]
    return bcrypt.using(rounds=12).hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Controleer of het ingevoerde wachtwoord overeenkomt met de opgeslagen hash.
    Truncate naar 72 bytes zoals bcrypt vereist.
    """
    plain = plain[:72]
    try:
        return bcrypt.verify(plain, hashed)
    except Exception:
        return False

# -----------------------------------------------------
# JWT TOKEN FUNCTIES
# -----------------------------------------------------
def create_access_token(subject: str, role: str) -> str:
    """Genereer een nieuw JWT access token."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "role": role, "exp": expire, "iat": datetime.utcnow()}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decodeer en valideer een JWT token."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# -----------------------------------------------------
# DEPENDENCIES VOOR ROUTE-BESCHERMING
# -----------------------------------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Controleer het Bearer-token en geef de ingelogde gebruiker terug."""
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Niet ingelogd of token ongeldig.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise auth_error
    except JWTError:
        raise auth_error

    user: Optional[User] = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise auth_error

    return user


def require_role(*allowed_roles: str):
    """Gebruik: Depends(require_role('owner')) of meerdere rollen."""
    def _role_dep(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Onvoldoende rechten.",
            )
        return current_user
    return _role_dep
