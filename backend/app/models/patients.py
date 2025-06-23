# backend/app/models/patient.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    Date,
    Boolean,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(20), unique=True, index=True)  # P001, P002, etc.
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date)
    gender = Column(String(10))
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    medical_history = Column(Text)
    allergies = Column(Text)
    current_medications = Column(Text)
    blood_group = Column(String(5))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    visits = relationship("Visit", back_populates="patient")
    bills = relationship("Bill", back_populates="patient")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    visit_id = Column(String(20), unique=True, index=True)  # V001, V002, etc.
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String(10), nullable=False)
    doctor = Column(String(100))
    visit_type = Column(String(50))  # consultation, follow-up, emergency
    status = Column(
        String(20), default="scheduled"
    )  # scheduled, completed, cancelled, no-show
    chief_complaint = Column(Text)
    diagnosis = Column(Text)
    treatment = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="visits")
    bills = relationship("Bill", back_populates="visit")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(20), unique=True, index=True)  # INV-001, INV-002, etc.
    patient_id = Column(Integer, ForeignKey("patients.id"))
    visit_id = Column(Integer, ForeignKey("visits.id"), nullable=True)
    amount = Column(Integer)  # Store as cents to avoid float issues
    status = Column(String(20), default="pending")  # pending, paid, overdue, cancelled
    services = Column(Text)
    date_created = Column(Date, default=datetime.utcnow().date)
    due_date = Column(Date)
    paid_date = Column(Date, nullable=True)
    payment_method = Column(String(50), nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="bills")
    visit = relationship("Visit", back_populates="bills")
