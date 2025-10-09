# crud.py
from sqlalchemy.orm import Session, selectinload

# ---- MODELS ----
from models.patient import Patient
from models.blessure import Blessure
from models.baseline import Baseline
from models.week6 import Week6
from models.maand3 import Maand3
from models.maand45 import Maand45
from models.maand6 import Maand6

# ---- SCHEMAS ----
from schemas.patient import PatientSchema
from schemas.blessure import BlessureSchema, BlessureUpdateSchema
from schemas.baseline import BaselineSchema
from schemas.week6 import Week6Schema
from schemas.maand3 import Maand3Schema
from schemas.maand45 import Maand45Schema
from schemas.maand6 import Maand6Schema


# =====================================================
#  P A T I E N T E N
# =====================================================
def get_all_patients(db: Session):
    return db.query(Patient).options(selectinload(Patient.blessures)).all()


def get_patient_by_id(db: Session, patient_id: int):
    return (
        db.query(Patient)
        .options(selectinload(Patient.blessures))
        .filter(Patient.patient_id == patient_id)
        .first()
    )


# =====================================================
#  B L E S S U R E S
# =====================================================
def get_all_blessures(db: Session):
    return db.query(Blessure).options(selectinload(Blessure.patient)).all()


def get_blessure_by_id(db: Session, blessure_id: int):
    return (
        db.query(Blessure)
        .options(selectinload(Blessure.patient))
        .filter(Blessure.blessure_id == blessure_id)
        .first()
    )


def create_blessure(db: Session, blessure: BlessureSchema):
    if not blessure.patient_id:
        raise ValueError("❌ 'patient_id' is verplicht om een blessure te koppelen aan een patiënt.")
    db_blessure = Blessure(**blessure.dict())
    db.add(db_blessure)
    db.commit()
    db.refresh(db_blessure)
    return db_blessure


def update_blessure(db: Session, blessure_id: int, blessure: BlessureUpdateSchema):
    db_blessure = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not db_blessure:
        return None
    for key, value in blessure.dict(exclude_unset=True).items():
        setattr(db_blessure, key, value)
    db.commit()
    db.refresh(db_blessure)
    return db_blessure


def delete_blessure(db: Session, blessure_id: int):
    db_blessure = db.query(Blessure).filter(Blessure.blessure_id == blessure_id).first()
    if not db_blessure:
        return None
    db.delete(db_blessure)
    db.commit()
    return True


# =====================================================
#  TESTMOMENTEN (BASELINE, WEEK6, MAAND3, MAAND4.5, MAAND6)
# =====================================================

# ---- BASELINE ----
def get_all_baseline(db: Session):
    return db.query(Baseline).options(selectinload(Baseline.blessure)).all()


def get_baseline_by_id(db: Session, blessure_id: int):
    return (
        db.query(Baseline)
        .options(selectinload(Baseline.blessure))
        .filter(Baseline.blessure_id == blessure_id)
        .first()
    )


# ---- WEEK 6 ----
def get_all_week6(db: Session):
    return db.query(Week6).options(selectinload(Week6.blessure)).all()


def get_week6_by_id(db: Session, blessure_id: int):
    return (
        db.query(Week6)
        .options(selectinload(Week6.blessure))
        .filter(Week6.blessure_id == blessure_id)
        .first()
    )


# ---- MAAND 3 ----
def get_all_maand3(db: Session):
    return db.query(Maand3).options(selectinload(Maand3.blessure)).all()


def get_maand3_by_id(db: Session, blessure_id: int):
    return (
        db.query(Maand3)
        .options(selectinload(Maand3.blessure))
        .filter(Maand3.blessure_id == blessure_id)
        .first()
    )


# ---- MAAND 4.5 ----
def get_all_maand45(db: Session):
    return db.query(Maand45).options(selectinload(Maand45.blessure)).all()


def get_maand45_by_id(db: Session, blessure_id: int):
    return (
        db.query(Maand45)
        .options(selectinload(Maand45.blessure))
        .filter(Maand45.blessure_id == blessure_id)
        .first()
    )


# ---- MAAND 6 ----
def get_all_maand6(db: Session):
    return db.query(Maand6).options(selectinload(Maand6.blessure)).all()


def get_maand6_by_id(db: Session, blessure_id: int):
    return (
        db.query(Maand6)
        .options(selectinload(Maand6.blessure))
        .filter(Maand6.blessure_id == blessure_id)
        .first()
    )


# =====================================================
#  T I M E L I N E
# =====================================================
def get_timeline(db: Session, blessure_id: int):
    """Laad blessure + alle gekoppelde testmomenten + patiënt in één query."""
    return (
        db.query(Blessure)
        .options(
            selectinload(Blessure.patient),
            selectinload(Blessure.baseline),
            selectinload(Blessure.week6),
            selectinload(Blessure.maand3),
            selectinload(Blessure.maand45),
            selectinload(Blessure.maand6),
        )
        .filter(Blessure.blessure_id == blessure_id)
        .first()
    )
