# =====================================================
# FILE: routers/auth_router.py
# Revo Sport - login, profiel en registratie
# =====================================================

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from db import get_db
from models import User
from security import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user,
    require_role,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# -----------------------------------------------------
# LOGIN ROUTE
# -----------------------------------------------------
@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Inlogroute:
    - username = email
    - password = wachtwoord
    Retourneert een JWT-token bij succesvolle login.
    """
    user = db.query(User).filter(User.email == form.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="❌ Ongeldige login of wachtwoord"
        )

    if not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="❌ Ongeldige login of wachtwoord"
        )

    token = create_access_token(subject=user.email, role=user.role)
    return {"access_token": token, "token_type": "bearer"}


# -----------------------------------------------------
# PROFIEL OPVRAGEN
# -----------------------------------------------------
@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    """
    Geeft info over de huidige ingelogde gebruiker.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": str(current_user.created_at)
    }


# -----------------------------------------------------
# NIEUWE THERAPEUT REGISTREREN (ALLEEN OWNER)
# -----------------------------------------------------
@router.post("/register_therapist")
def register_therapist(
    email: str,
    full_name: str,
    password: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("owner")),
):
    """
    Alleen gebruikers met rol 'owner' mogen nieuwe therapeuten registreren.
    """
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email bestaat al.")

    # truncate wachtwoord preventief (bcrypt-limiet)
    password = password[:72]

    new_user = User(
        email=email,
        full_name=full_name,
        role="therapist",
        password_hash=hash_password(password),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"status": "✅ Gebruiker toegevoegd", "id": new_user.id, "email": new_user.email}


# -----------------------------------------------------
# TIJDELIJK: EERSTE OWNER REGISTREREN
# -----------------------------------------------------
@router.post("/register_owner")
def register_owner(
    email: str,
    full_name: str,
    password: str,
    db: Session = Depends(get_db),
):
    """
    Tijdelijke route om de eerste owner-account aan te maken via Swagger.
    Wordt verwijderd zodra de eerste gebruiker bestaat.
    """
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email bestaat al.")

    # truncate wachtwoord preventief (bcrypt-limiet)
    password = password[:72]

    new_user = User(
        email=email,
        full_name=full_name,
        role="owner",
        password_hash=hash_password(password),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"status": "✅ Owner-account aangemaakt", "email": new_user.email}
