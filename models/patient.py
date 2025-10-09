from sqlalchemy import Column, BigInteger, String, Enum, Date
from sqlalchemy.orm import relationship
from db import Base


class Patient(Base):
    __tablename__ = "patienten"

    patient_id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    naam = Column(String(50), nullable=False)
    geslacht = Column(Enum("Man", "Vrouw", "X"), nullable=True)
    geboortedatum = Column(Date, nullable=True)

    # Relatie: één patiënt → meerdere blessures
    blessures = relationship(
        "Blessure",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
