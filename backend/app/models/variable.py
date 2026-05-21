from sqlalchemy import Column,Integer,String,TIMESTAMP
from sqlalchemy.sql import func

from app.database.base import Base

class Variable(Base):
    __tablename__ = "variables"

    id = Column(Integer, primary_key=True, index=True)
    sensor_code = Column(String(20), unique=True, nullable=False)
    variable_name = Column(String(100), unique=True, nullable=False)
    unit = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())