# =====================================================
# FILE: scripts/create_user.py
# Doel: eerste owner-account aanmaken in Revo Sport database
# =====================================================

from sqlalchemy.orm import Session
from db import SessionLocal
from models import User
from security import hash_password

def create_owner(email: str, full_name: str, password: str):
    """Maak een eerste eigenaar-account aan in de users-tabel."""
    db: Session = SessionLocal()
    try:
        # Bestaat de user al?
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("❌ Gebruiker bestaat al in de database.")
            return

        # Nieuwe eigenaar aanmaken
        new_user = User(
            email=email,
            full_name=full_name,
            role="owner",
            password_hash=hash_password(password),
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ Nieuwe owner aangemaakt: {new_user.full_name} ({new_user.email})")
    finally:
        db.close()


if __name__ == "__main__":
    # === Vul hieronder je gegevens in ===
    create_owner(
        email="frederic@revosport.be",
        full_name="Frédéric Vereecken",
        password="SterkWachtwoord123"
    )
