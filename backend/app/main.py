from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.base import Base

from app.routes import station_routes
from app.routes import measurement_routes
from app.routes import alert_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Atrato Monitoring API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(station_routes.router)
app.include_router(measurement_routes.router)
app.include_router(alert_routes.router)

@app.get("/")
def root():
    return {
        "message": "Atrato Monitoring API running"
    }