# schemas/timeline.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from schemas.patient import PatientSchema
from schemas.blessure import BlessureSchema
from schemas.baseline import BaselineSchema
from schemas.week6 import Week6Schema
from schemas.maand3 import Maand3Schema
from schemas.maand45 import Maand45Schema
from schemas.maand6 import Maand6Schema


class TimelineSchema(BaseModel):
    blessure: BlessureSchema
    patient: Optional[PatientSchema] = None
    baseline: Optional[BaselineSchema] = None
    week6: Optional[Week6Schema] = None
    maand3: Optional[Maand3Schema] = None
    maand45: Optional[Maand45Schema] = None
    maand6: Optional[Maand6Schema] = None

    model_config = ConfigDict(from_attributes=True)
