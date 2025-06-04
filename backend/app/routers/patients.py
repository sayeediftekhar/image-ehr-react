from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime

from app.db.context import get_db_cursor

router = APIRouter()
logger = logging.getLogger(__name__)

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None

@router.post("/patients")
async def create_patient(patient: PatientCreate):
    try:
        with get_db_cursor() as cur:
            cur.execute("""
                INSERT INTO patients (
                    name, age, gender, phone, email, address, 
                    emergency_contact, medical_history, allergies, 
                    current_medications, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                patient.name, patient.age, patient.gender, patient.phone,
                patient.email, patient.address, patient.emergency_contact,
                patient.medical_history, patient.allergies, patient.current_medications,
                datetime.now(), datetime.now()
            ))
            
            patient_id = cur.fetchone()[0]
            logger.info(f"✅ Patient created successfully with ID: {patient_id}")
            
            return {"success": True, "message": "Patient added successfully", "patient_id": patient_id}
            
    except Exception as e:
        logger.error(f"❌ Error creating patient: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create patient: {str(e)}")
