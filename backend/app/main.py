from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.base import Base

from app.routes import station_routes
from app.routes import measurement_routes
from app.routes import alert_routes
from app.agents import router as agent_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AtratoCentinela AI API",
    version="2.0.0"
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
app.include_router(agent_router.router)

@app.get("/")
def root():
    return {
        "message": "Atrato Monitoring API running"
    }