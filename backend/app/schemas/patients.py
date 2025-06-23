# backend/app/schemas/patient.py
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List


# Patient Schemas
class PatientBase(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    blood_group: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    full_name: Optional[str] = None


class Patient(PatientBase):
    id: int
    patient_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Visit Schemas
class VisitBase(BaseModel):
    appointment_date: date
    appointment_time: str
    doctor: Optional[str] = None
    visit_type: str = "consultation"
    chief_complaint: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None


class VisitCreate(VisitBase):
    patient_id: int


class VisitUpdate(VisitBase):
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    status: Optional[str] = None


class Visit(VisitBase):
    id: int
    visit_id: str
    patient_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Bill Schemas
class BillBase(BaseModel):
    amount: float  # Will be converted to cents in the service
    services: str
    due_date: date
    notes: Optional[str] = None


class BillCreate(BillBase):
    patient_id: int
    visit_id: Optional[int] = None


class BillUpdate(BillBase):
    amount: Optional[float] = None
    services: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    paid_date: Optional[date] = None


class Bill(BillBase):
    id: int
    bill_number: str
    patient_id: int
    visit_id: Optional[int] = None
    status: str
    date_created: date
    paid_date: Optional[date] = None
    payment_method: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
