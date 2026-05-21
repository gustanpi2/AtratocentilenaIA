from sqlalchemy import Column,BigInteger,Integer,Text,Enum,DateTime,TIMESTAMP,ForeignKey
from sqlalchemy.sql import func

from app.database.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(BigInteger, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    alert_level = Column(Enum("LOW","MEDIUM","HIGH","CRITICAL"), nullable=False)
    message = Column(Text)
    triggered_at = Column(DateTime, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())