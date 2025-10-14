from sqlalchemy import Column, Integer, String, Enum, Boolean, TIMESTAMP
from sqlalchemy.sql import func
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(190), unique=True, nullable=False)
    full_name = Column(String(190), nullable=False)

    # ✅ Enum veilig gedefinieerd met expliciete waarden
    role = Column(
        Enum("owner", "therapist", name="user_roles"),
        nullable=False,
        default="therapist"
    )

    # ✅ bcrypt-hashes zijn ±60 tekens, maar reserveer wat marge
    password_hash = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    # ✅ MFA secret optioneel, maar uniek per gebruiker indien ooit gebruikt
    mfa_secret = Column(String(64), unique=True, nullable=True)

    # ✅ Automatische timestamp (werkt op alle engines)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
