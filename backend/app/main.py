import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine
from app.database.base import Base

from app.routes import station_routes
from app.routes import measurement_routes
from app.routes import alert_routes
from app.agents import router as agent_router
from app.integrations.telegram import router as telegram_router
from app.integrations.telegram.bot import polling_loop, stop_polling
from app.integrations.telegram.config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_ENABLED

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if TELEGRAM_ENABLED:
        token_pref = TELEGRAM_BOT_TOKEN[:12] + "..." if TELEGRAM_BOT_TOKEN else "(vacio)"
        logger.info(f"[Startup] Telegram enabled — token: {token_pref}, chat_id: {TELEGRAM_CHAT_ID}")
    else:
        reasons = []
        if not TELEGRAM_BOT_TOKEN:
            reasons.append("TELEGRAM_BOT_TOKEN vacio")
        if not TELEGRAM_CHAT_ID:
            reasons.append("TELEGRAM_CHAT_ID vacio")
        logger.info(f"[Startup] Telegram disabled — {', '.join(reasons)}")

    polling_task = asyncio.create_task(polling_loop())
    yield
    stop_polling()
    polling_task.cancel()
    try:
        await polling_task
    except asyncio.CancelledError:
        pass


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AtratoCentinela AI API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(station_routes.router)
app.include_router(measurement_routes.router)
app.include_router(alert_routes.router)
app.include_router(agent_router.router)
app.include_router(telegram_router)

@app.get("/")
def root():
    return {
        "message": "Atrato Monitoring API running"
    }