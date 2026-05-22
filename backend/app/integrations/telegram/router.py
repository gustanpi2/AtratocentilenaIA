import logging

from fastapi import APIRouter, HTTPException

from .config import TELEGRAM_ENABLED, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_POLL_INTERVAL_SECONDS
from .service import send_telegram_alert, send_telegram_message
from .schemas import TelegramAlertRequest, TelegramAlertResponse
from .bot import _polling_active

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/telegram",
    tags=["Telegram Integration"],
)


@router.get("/status")
def telegram_status():
    return {
        "enabled": TELEGRAM_ENABLED,
        "token_loaded": bool(TELEGRAM_BOT_TOKEN),
        "chat_id_loaded": bool(TELEGRAM_CHAT_ID),
        "polling_running": _polling_active,
    }


@router.get("/debug")
def telegram_debug():
    return {
        "token_loaded": bool(TELEGRAM_BOT_TOKEN),
        "chat_id_loaded": bool(TELEGRAM_CHAT_ID),
        "polling_running": _polling_active,
        "enabled": TELEGRAM_ENABLED,
        "token_prefix": TELEGRAM_BOT_TOKEN[:12] + "..." if TELEGRAM_BOT_TOKEN else "",
        "chat_id": TELEGRAM_CHAT_ID if TELEGRAM_CHAT_ID else "",
    }


@router.post("/send-alert", response_model=TelegramAlertResponse)
async def send_alert(req: TelegramAlertRequest):
    if not TELEGRAM_ENABLED:
        reason = []
        if not TELEGRAM_BOT_TOKEN:
            reason.append("TELEGRAM_BOT_TOKEN vacío")
        if not TELEGRAM_CHAT_ID:
            reason.append("TELEGRAM_CHAT_ID vacío")
        msg = f"Telegram no configurado: {', '.join(reason)}"
        logger.warning(f"[Telegram] {msg}")
        return TelegramAlertResponse(ok=False, message=msg)

    ok = await send_telegram_alert(
        station_name=req.station_name,
        station_node=req.station_node,
        nivel_value=req.nivel_value,
        connection_status=req.connection_status,
        risk_level=req.risk_level,
        recommendation=req.recommendation,
        station_id=req.station_id,
        lat=req.lat,
        lng=req.lng,
        force=req.force,
    )

    if ok:
        return TelegramAlertResponse(ok=True, message="Alerta enviada a Telegram")
    return TelegramAlertResponse(ok=False, message="Cooldown activo o error de envío")


@router.post("/test")
async def send_test():
    if not TELEGRAM_ENABLED:
        reason = []
        if not TELEGRAM_BOT_TOKEN:
            reason.append("TELEGRAM_BOT_TOKEN vacío")
        if not TELEGRAM_CHAT_ID:
            reason.append("TELEGRAM_CHAT_ID vacío")
        msg = f"Telegram no configurado: {', '.join(reason)}"
        logger.warning(f"[Telegram] {msg}")
        return TelegramAlertResponse(ok=False, message=msg)

    ok = await send_telegram_message(
        "🟢 *Prueba exitosa* — AtratoCentinela AI está conectado a Telegram.\n\n"
        "El sistema de alertas funciona correctamente.",
    )

    if ok:
        return TelegramAlertResponse(ok=True, message="Mensaje de prueba enviado")
    return TelegramAlertResponse(ok=False, message="Error al enviar mensaje de prueba")
