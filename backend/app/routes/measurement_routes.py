from fastapi import APIRouter
from app.database.connection import SessionLocal
from app.models.measurement import Measurement

router = APIRouter(
    prefix="/measurements",
    tags=["Measurements"]
)

@router.get("/")
def get_measurements():
    db = SessionLocal()

    measurements = db.query(Measurement).all()

    return measurements