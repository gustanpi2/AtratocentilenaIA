from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.station import Station
from app.models.variable import Variable
from app.models.measurement import Measurement
from app.models.alert import Alert
from app.agents.models import Conversation, Message


def get_db() -> Session:
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


def get_all_stations() -> list[dict]:
    db = get_db()
    stations = db.query(Station).all()
    result = []
    for s in stations:
        result.append({
            "id": s.id,
            "code": s.station_code,
            "name": s.station_name,
            "latitude": float(s.latitude) if s.latitude else None,
            "longitude": float(s.longitude) if s.longitude else None,
        })
    db.close()
    return result


def get_all_variables() -> list[dict]:
    db = get_db()
    variables = db.query(Variable).all()
    result = []
    for v in variables:
        result.append({
            "id": v.id,
            "code": v.sensor_code,
            "name": v.variable_name,
            "unit": v.unit,
        })
    db.close()
    return result


def get_latest_measurements() -> list[dict]:
    db = get_db()
    subquery = (
        db.query(
            Measurement.station_id,
            Measurement.variable_id,
            Measurement.measured_at,
        )
        .group_by(Measurement.station_id, Measurement.variable_id)
        .all()
    )
    result = []
    for station_id, variable_id, _ in subquery:
        latest = (
            db.query(Measurement)
            .filter(
                Measurement.station_id == station_id,
                Measurement.variable_id == variable_id,
            )
            .order_by(desc(Measurement.measured_at))
            .first()
        )
        if latest:
            result.append({
                "id": latest.id,
                "station_id": latest.station_id,
                "variable_id": latest.variable_id,
                "value": float(latest.value),
                "unit": "",
                "measured_at": latest.measured_at.isoformat() if latest.measured_at else None,
            })
    db.close()
    return result


def get_measurements_by_station(station_id: int, limit: int = 20) -> list[dict]:
    db = get_db()
    measurements = (
        db.query(Measurement)
        .filter(Measurement.station_id == station_id)
        .order_by(desc(Measurement.measured_at))
        .limit(limit)
        .all()
    )
    result = []
    for m in measurements:
        result.append({
            "id": m.id,
            "station_id": m.station_id,
            "variable_id": m.variable_id,
            "value": float(m.value),
            "measured_at": m.measured_at.isoformat() if m.measured_at else None,
        })
    db.close()
    return result


def get_recent_measurements(hours: int = 24) -> list[dict]:
    db = get_db()
    since = datetime.utcnow() - timedelta(hours=hours)
    measurements = (
        db.query(Measurement)
        .filter(Measurement.measured_at >= since)
        .order_by(desc(Measurement.measured_at))
        .all()
    )
    result = []
    for m in measurements:
        result.append({
            "id": m.id,
            "station_id": m.station_id,
            "variable_id": m.variable_id,
            "value": float(m.value),
            "measured_at": m.measured_at.isoformat() if m.measured_at else None,
        })
    db.close()
    return result


def get_active_alerts(hours: int = 48) -> list[dict]:
    db = get_db()
    since = datetime.utcnow() - timedelta(hours=hours)
    alerts = (
        db.query(Alert)
        .filter(Alert.triggered_at >= since)
        .order_by(desc(Alert.triggered_at))
        .all()
    )
    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "station_id": a.station_id,
            "level": a.alert_level,
            "message": a.message,
            "triggered_at": a.triggered_at.isoformat() if a.triggered_at else None,
        })
    db.close()
    return result


def create_alert(
    station_id: int,
    level: str,
    message: str,
    triggered_at: datetime | None = None,
) -> dict:
    db = get_db()
    alert = Alert(
        station_id=station_id,
        alert_level=level,
        message=message,
        triggered_at=triggered_at or datetime.utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    result = {
        "id": alert.id,
        "station_id": alert.station_id,
        "level": alert.alert_level,
        "message": alert.message,
        "triggered_at": alert.triggered_at.isoformat() if alert.triggered_at else None,
    }
    db.close()
    return result


def get_station_by_id(station_id: int) -> dict | None:
    db = get_db()
    s = db.query(Station).filter(Station.id == station_id).first()
    db.close()
    if not s:
        return None
    return {
        "id": s.id,
        "code": s.station_code,
        "name": s.station_name,
        "latitude": float(s.latitude) if s.latitude else None,
        "longitude": float(s.longitude) if s.longitude else None,
    }


def get_variable_by_id(variable_id: int) -> dict | None:
    db = get_db()
    v = db.query(Variable).filter(Variable.id == variable_id).first()
    db.close()
    if not v:
        return None
    return {
        "id": v.id,
        "code": v.sensor_code,
        "name": v.variable_name,
        "unit": v.unit,
    }


def build_system_context(station_id: int | None = None) -> dict:
    stations = get_all_stations()
    variables = get_all_variables()
    latest = get_recent_measurements(hours=24)
    alerts = get_active_alerts(hours=48)

    var_map = {v["id"]: v for v in variables}
    station_map = {s["id"]: s for s in stations}

    enriched_measurements = []
    for m in latest:
        var = var_map.get(m["variable_id"], {})
        station = station_map.get(m["station_id"], {})
        enriched_measurements.append({
            **m,
            "variable_name": var.get("name", "Desconocido"),
            "unit": var.get("unit", ""),
            "station_name": station.get("name", "Desconocida"),
        })

    enriched_alerts = []
    for a in alerts:
        station = station_map.get(a["station_id"], {})
        enriched_alerts.append({
            **a,
            "station_name": station.get("name", "Desconocida"),
        })

    return {
        "stations": stations,
        "variables": variables,
        "latest_measurements": enriched_measurements,
        "alerts": enriched_alerts,
    }


# ─── Conversation persistence ─────────────────────────────────────────────────

def create_conversation(session_id: str, title: str = "Nueva conversación") -> dict:
    db = get_db()
    conv = Conversation(session_id=session_id, title=title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    result = {
        "id": conv.id,
        "title": conv.title,
        "session_id": conv.session_id,
        "status": conv.status,
        "message_count": conv.message_count,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }
    db.close()
    return result


def list_conversations(session_id: str, limit: int = 50) -> list[dict]:
    db = get_db()
    convs = (
        db.query(Conversation)
        .filter(Conversation.session_id == session_id)
        .order_by(desc(Conversation.updated_at))
        .limit(limit)
        .all()
    )
    result = []
    for c in convs:
        result.append({
            "id": c.id,
            "title": c.title,
            "session_id": c.session_id,
            "status": c.status,
            "message_count": c.message_count,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    db.close()
    return result


def get_conversation(conversation_id: int) -> dict | None:
    db = get_db()
    c = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not c:
        db.close()
        return None

    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )
    result = {
        "id": c.id,
        "title": c.title,
        "session_id": c.session_id,
        "status": c.status,
        "message_count": c.message_count,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        "messages": [
            {
                "id": m.id,
                "conversation_id": m.conversation_id,
                "role": m.role,
                "content": m.content,
                "source": m.source,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in msgs
        ],
    }
    db.close()
    return result


def update_conversation_title(conversation_id: int, title: str) -> dict | None:
    db = get_db()
    c = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not c:
        db.close()
        return None
    c.title = title
    db.commit()
    db.refresh(c)
    result = {
        "id": c.id,
        "title": c.title,
        "session_id": c.session_id,
        "status": c.status,
        "message_count": c.message_count,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }
    db.close()
    return result


def delete_conversation(conversation_id: int) -> bool:
    db = get_db()
    c = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not c:
        db.close()
        return False
    db.delete(c)
    db.commit()
    db.close()
    return True


def add_message(
    conversation_id: int,
    role: str,
    content: str,
    source: str = "llm",
    metadata_json: dict | None = None,
) -> dict:
    db = get_db()
    msg = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        source=source,
        metadata_json=metadata_json,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Update message count
    db.query(Conversation).filter(Conversation.id == conversation_id).update(
        {Conversation.message_count: Conversation.message_count + 1}
    )
    db.commit()

    result = {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "role": msg.role,
        "content": msg.content,
        "source": msg.source,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }
    db.close()
    return result


def get_messages(conversation_id: int, limit: int = 100) -> list[dict]:
    db = get_db()
    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .limit(limit)
        .all()
    )
    result = [
        {
            "id": m.id,
            "conversation_id": m.conversation_id,
            "role": m.role,
            "content": m.content,
            "source": m.source,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in msgs
    ]
    db.close()
    return result
