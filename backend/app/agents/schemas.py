from datetime import datetime
from pydantic import BaseModel


# ─── Query ────────────────────────────────────────────────────────────────────

class AgentQueryRequest(BaseModel):
    question: str
    conversation_id: int | None = None
    session_id: str | None = None


class AgentQueryResponse(BaseModel):
    answer: str
    conversation_id: int | None = None
    message_id: int | None = None
    source: str = "llm"


# ─── Context ──────────────────────────────────────────────────────────────────

class AgentContextRequest(BaseModel):
    station_id: int | None = None
    include_alerts: bool = True
    include_measurements: bool = True


class AgentContextResponse(BaseModel):
    stations: list[dict]
    alerts: list[dict]
    latest_measurements: list[dict]


# ─── Alert evaluation ─────────────────────────────────────────────────────────

class AgentAlertEvalRequest(BaseModel):
    station_id: int
    mode: str = "ai"


class AgentAlertEvalResponse(BaseModel):
    should_alert: bool
    severity: str | None = None
    message: str | None = None
    reason: str | None = None
    cooldown_remaining: int | None = None


# ─── Conversation ─────────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    session_id: str
    title: str = "Nueva conversación"


class ConversationSummary(BaseModel):
    id: int
    title: str
    session_id: str
    status: str
    message_count: int
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ConversationDetail(BaseModel):
    id: int
    title: str
    session_id: str
    status: str
    message_count: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    messages: list["MessageOut"] = []


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    source: str
    created_at: datetime | None = None


class MessageCreate(BaseModel):
    conversation_id: int
    role: str
    content: str
    source: str = "llm"
    metadata_json: dict | None = None


class ConversationListResponse(BaseModel):
    conversations: list[ConversationSummary]
    total: int

