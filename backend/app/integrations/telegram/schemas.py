from pydantic import BaseModel
from typing import Optional


class TelegramAlertRequest(BaseModel):
    station_name: str
    station_node: str
    station_id: int
    nivel_value: str
    connection_status: str
    risk_level: str
    recommendation: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    force: bool = False


class TelegramAlertResponse(BaseModel):
    ok: bool
    message: str = ""
