from fastapi import APIRouter
from app.database.connection import SessionLocal
from app.models.station import Station

router = APIRouter(
    prefix="/stations",
    tags=["Stations"]
)

@router.get("/")
def get_stations():
    db = SessionLocal()

    stations = db.query(Station).all()

    return stations