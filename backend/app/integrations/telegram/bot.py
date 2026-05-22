"""
Telegram bot — command handling and polling system.
Reuses the existing agent service for Q&A.
Runs as a background asyncio task within FastAPI.
"""

import asyncio
import logging
from datetime import datetime

import httpx

from .config import (
    TELEGRAM_ENABLED,
    TELEGRAM_API_BASE,
    TELEGRAM_POLL_INTERVAL_SECONDS,
    ALLOWED_CHAT_IDS,
)
from .service import send_telegram_message, is_chat_authorized, send_telegram_alert, _reset_cooldown
from .formatter import format_system_status, format_alertas_list, format_help, format_station_status
from app.agents.service import query_llm
from app.agents.db_service import build_system_context, get_all_stations

logger = logging.getLogger(__name__)

_last_update_id: int = 0
_polling_active: bool = False


async def _get_updates() -> list[dict]:
    """Fetch pending updates from Telegram."""
    global _last_update_id
    url = f"{TELEGRAM_API_BASE}/getUpdates"
    payload = {
        "offset": _last_update_id + 1,
        "timeout": 5,
        "allowed_updates": ["message"],
    }
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("ok"):
                    return data.get("result", [])
        except Exception as e:
            logger.debug(f"[Telegram] getUpdates error: {e}")
    return []


async def _handle_command(text: str, chat_id: int) -> str:
    """Process a bot command and return the response text."""
    cmd = text.strip().lower()

    if cmd == "/estado" or cmd == "/status":
        ctx = build_system_context()
        stations = ctx.get("stations", [])
        alerts = ctx.get("alerts", [])
        critical_count = len([a for a in alerts if a.get("level") == "CRITICAL"])
        warning_count = len([a for a in alerts if a.get("level") in ("WARNING", "HIGH")])
        total = len(stations)
        online = total  # approximate
        offline = 0
        autonomous = 0

        # Build station detail lines from DB + formatter
        station_lines = []
        for s in stations[:10]:
            station_alerts = [a for a in alerts if a.get("station_id") == s.get("id")]
            risk = "critical" if any(a.get("level") == "CRITICAL" for a in station_alerts) else \
                   "warning" if any(a.get("level") in ("WARNING", "HIGH") for a in station_alerts) else "normal"
            icon = {"critical": "🔴", "warning": "🟡", "normal": "🟢"}[risk]
            station_lines.append(f"{icon} {s.get('name', '?')} ({s.get('code', '?')})")

        detail = "\n".join(station_lines) if station_lines else ""

        return format_system_status(
            total=total,
            online=total - offline,
            offline=offline,
            autonomous=autonomous,
            critical=critical_count,
            stations_detail=detail,
        )

    if cmd == "/alertas":
        ctx = build_system_context()
        alerts = ctx.get("alerts", [])
        return format_alertas_list(alerts)

    if cmd == "/estaciones":
        stations = get_all_stations()
        if not stations:
            return "No hay estaciones registradas en el sistema."
        lines = ["📡 *ESTACIONES DE MONITOREO*", ""]
        for s in stations:
            lat = s.get("latitude", "?")
            lng = s.get("longitude", "?")
            lines.append(f"  • *{s.get('name', '?')}* (`{s.get('code', '?')}`)")
            if lat and lng:
                lines.append(f"    📍 {lat}, {lng}")
        lines.append("")
        lines.append(f"_Total: {len(stations)} estaciones_")
        return "\n".join(lines)

    if cmd == "/help" or cmd == "/ayuda" or cmd == "/start":
        return format_help()

    return ""


async def _process_update(update: dict):
    """Process a single Telegram update (message from user)."""
    global _last_update_id

    update_id = update.get("update_id", 0)
    if update_id > _last_update_id:
        _last_update_id = update_id

    message = update.get("message", {})
    chat = message.get("chat", {})
    chat_id = chat.get("id", 0)
    text = (message.get("text") or "").strip()

    if not text or not chat_id:
        return

    if not is_chat_authorized(chat_id):
        logger.warning(f"[Telegram] Unauthorized chat_id: {chat_id}")
        await send_telegram_message(
            "⛔ No tienes permiso para usar este bot.",
            chat_id=chat_id,
        )
        return

    is_command = text.startswith("/")

    if is_command:
        response = await _handle_command(text, chat_id)
        if response:
            await send_telegram_message(response, chat_id=chat_id)
        return

    # Natural language question — reuse existing agent
    try:
        answer = await query_llm(text)
        await send_telegram_message(answer, chat_id=chat_id)
    except Exception as e:
        logger.error(f"[Telegram] Agent query error: {e}")
        await send_telegram_message(
            "Lo siento, ocurrió un error al procesar tu pregunta. Intenta de nuevo.",
            chat_id=chat_id,
        )


async def polling_loop():
    """Background polling loop. Runs as a FastAPI lifespan task."""
    global _polling_active

    if not TELEGRAM_ENABLED:
        logger.info("[Telegram] Not configured — polling disabled")
        return

    _polling_active = True
    logger.info("[Telegram] Polling started")

    while _polling_active:
        try:
            updates = await _get_updates()
            for update in updates:
                await _process_update(update)
        except Exception as e:
            logger.error(f"[Telegram] Polling error: {e}")

        await asyncio.sleep(TELEGRAM_POLL_INTERVAL_SECONDS)


def stop_polling():
    """Stop the polling loop gracefully."""
    global _polling_active
    _polling_active = False
    logger.info("[Telegram] Polling stopped")
