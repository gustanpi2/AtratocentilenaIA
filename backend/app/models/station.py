from sqlalchemy import Column,Integer,String,DECIMAL,TIMESTAMP
from sqlalchemy.sql import func

from app.database.base import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(50), unique=True, nullable=False)
    station_name = Column(String(255), nullable=False)
    latitude = Column(DECIMAL(10,7), nullable=False)
    longitude = Column(DECIMAL(10,7), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())