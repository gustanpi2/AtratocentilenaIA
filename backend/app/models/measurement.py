from sqlalchemy import Column,BigInteger,Integer,DECIMAL,DateTime,TIMESTAMP,ForeignKey,UniqueConstraint
from sqlalchemy.sql import func

from app.database.base import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(BigInteger, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    variable_id = Column(Integer, ForeignKey("variables.id"), nullable=False)
    measured_at = Column(DateTime, nullable=False)
    value = Column(DECIMAL(12,4), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("station_id","variable_id","measured_at", name="uq_measurement"),
    )