import logging
import os
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# ── Explicit path to backend/.env ───────────────────────────────────
# __file__ = backend/app/integrations/telegram/config.py
# 4 parents up = backend/
_env_path = Path(__file__).resolve().parents[3] / ".env"
loaded = load_dotenv(dotenv_path=_env_path, override=True)
if loaded:
    logger.info(f"[Telegram] .env loaded from {_env_path}")
else:
    logger.warning(f"[Telegram] .env NOT found at {_env_path}")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

TELEGRAM_ENABLED = bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)

if TELEGRAM_BOT_TOKEN:
    prefix = TELEGRAM_BOT_TOKEN[:8]
    logger.info(f"[Telegram] TELEGRAM_BOT_TOKEN loaded — starts with: {prefix}...")
else:
    logger.warning("[Telegram] TELEGRAM_BOT_TOKEN is empty or not set")

if TELEGRAM_CHAT_ID:
    logger.info(f"[Telegram] TELEGRAM_CHAT_ID loaded — value: {TELEGRAM_CHAT_ID}")
else:
    logger.warning("[Telegram] TELEGRAM_CHAT_ID is empty or not set")

TELEGRAM_API_BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

ALLOWED_CHAT_IDS: list[int] = []
_raw = os.getenv("TELEGRAM_ALLOWED_CHAT_IDS", "")
if _raw:
    for part in _raw.split(","):
        part = part.strip()
        if part.isdigit():
            ALLOWED_CHAT_IDS.append(int(part))

if TELEGRAM_CHAT_ID and TELEGRAM_CHAT_ID.isdigit():
    cid = int(TELEGRAM_CHAT_ID)
    if cid not in ALLOWED_CHAT_IDS:
        ALLOWED_CHAT_IDS.append(cid)

TELEGRAM_ALERT_COOLDOWN_SECONDS = int(os.getenv("TELEGRAM_ALERT_COOLDOWN_SECONDS", "120"))
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

TELEGRAM_POLL_INTERVAL_SECONDS = int(os.getenv("TELEGRAM_POLL_INTERVAL_SECONDS", "3"))
