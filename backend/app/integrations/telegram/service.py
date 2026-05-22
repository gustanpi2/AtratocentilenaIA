"""
Telegram service — core send functions with cooldown.
Critical alerts: photo + caption (with text-only fallback).
Uses Telegram Bot API directly via httpx (no extra dependency).
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

import httpx

from .config import (
    TELEGRAM_ENABLED,
    TELEGRAM_API_BASE,
    TELEGRAM_CHAT_ID,
    TELEGRAM_ALERT_COOLDOWN_SECONDS,
    ALLOWED_CHAT_IDS,
)
from .formatter import format_alert_caption, format_full_alert
from .map_snapshot import build_static_map_url

logger = logging.getLogger(__name__)

_alert_cooldowns: dict[str, datetime] = {}


# ─── Core send functions ────────────────────────────────────────────────


async def send_telegram_message(
    text: str,
    chat_id: int | str | None = None,
    parse_mode: str = "Markdown",
) -> bool:
    """Send a text message to a Telegram chat. Returns True on success."""
    if not TELEGRAM_ENABLED:
        logger.warning("[Telegram] Not configured — skipping message")
        return False

    target = chat_id or TELEGRAM_CHAT_ID
    url = f"{TELEGRAM_API_BASE}/sendMessage"

    payload = {
        "chat_id": str(target),
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info(f"[Telegram] Message sent to {target}")
                return True
            else:
                logger.error(f"[Telegram] sendMessage failed — URL: {url} | status: {resp.status_code} | body: {resp.text[:500]}")
                return False
        except Exception as e:
            logger.error(f"[Telegram] sendMessage error: {e}")
            return False


async def send_telegram_photo(
    photo_url: str,
    caption: str = "",
    chat_id: int | str | None = None,
) -> bool:
    """Send a photo from a URL to a Telegram chat."""
    if not TELEGRAM_ENABLED:
        return False

    target = chat_id or TELEGRAM_CHAT_ID
    url = f"{TELEGRAM_API_BASE}/sendPhoto"

    payload = {
        "chat_id": str(target),
        "photo": photo_url,
        "caption": caption,
        "parse_mode": "Markdown",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info(f"[Telegram] Photo sent to {target}")
                return True
            logger.warning(f"[Telegram] sendPhoto failed — URL: {url} | status: {resp.status_code} | body: {resp.text[:300]}")
            return False
        except Exception as e:
            logger.error(f"[Telegram] sendPhoto error: {e}")
            return False


# ─── Cooldown ───────────────────────────────────────────────────────────


def _check_alert_cooldown(station_id: int) -> bool:
    """Check if enough time has passed since last alert for this station."""
    key = str(station_id)
    last = _alert_cooldowns.get(key)
    if last:
        elapsed = (datetime.utcnow() - last).total_seconds()
        if elapsed < TELEGRAM_ALERT_COOLDOWN_SECONDS:
            return False
    _alert_cooldowns[key] = datetime.utcnow()
    return True


def _reset_cooldown(station_id: int):
    """Reset cooldown (for manual restore)."""
    key = str(station_id)
    _alert_cooldowns.pop(key, None)


# ─── Critical alert: photo + caption, with text fallback ────────────────


async def send_telegram_alert(
    station_name: str,
    station_node: str,
    nivel_value: str,
    connection_status: str,
    risk_level: str,
    recommendation: str,
    station_id: int,
    lat: float | None = None,
    lng: float | None = None,
    chat_id: int | str | None = None,
    force: bool = False,
) -> bool:
    """Send a critical alert: photo + caption, fallback to text-only.

    Priority:
      1. Photo with caption (if GOOGLE_MAPS_API_KEY is configured)
      2. Text-only message (fallback)
    """
    if not force and not _check_alert_cooldown(station_id):
        logger.info(f"[Telegram] Cooldown active for station {station_id} — alert skipped")
        return False

    caption = format_alert_caption(
        station_name=station_name,
        station_node=station_node,
        nivel_value=nivel_value,
        connection_status=connection_status,
        risk_level=risk_level,
        recommendation=recommendation,
        lat=lat,
        lng=lng,
    )

    # Try photo + caption first
    photo_sent = False
    if lat is not None and lng is not None:
        logger.info(f"[Telegram] lat={lat}, lng={lng} — attempting map generation for {station_name}")
        map_url = build_static_map_url(
            lat=lat,
            lng=lng,
            station_name=station_name,
            severity=risk_level,
        )
        if map_url:
            logger.info(f"[Telegram] Map URL generated ({len(map_url)} chars) — sending photo...")
            photo_sent = await send_telegram_photo(map_url, caption=caption, chat_id=chat_id)
            logger.info(f"[Telegram] Photo sent? {photo_sent}")
        else:
            logger.warning(f"[Telegram] map_url is None (check GOOGLE_MAPS_API_KEY)")
    else:
        logger.warning(f"[Telegram] lat or lng is None — cannot generate map")

    if photo_sent:
        return True
    else:
        logger.info(f"[Telegram] Photo not sent — falling back to text-only alert")

    # Fallback: text-only
    full_text = format_full_alert(
        station_name=station_name,
        station_node=station_node,
        nivel_value=nivel_value,
        connection_status=connection_status,
        risk_level=risk_level,
        recommendation=recommendation,
        lat=lat,
        lng=lng,
    )

    return await send_telegram_message(full_text, chat_id=chat_id)


# ─── Authorization ──────────────────────────────────────────────────────


def is_chat_authorized(chat_id: int) -> bool:
    """Verify that a chat_id is allowed to interact with the bot."""
    if not ALLOWED_CHAT_IDS:
        return True
    return chat_id in ALLOWED_CHAT_IDS
