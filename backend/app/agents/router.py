from fastapi import APIRouter, HTTPException, Query

from .schemas import (
    AgentQueryRequest,
    AgentQueryResponse,
    AgentContextRequest,
    AgentContextResponse,
    AgentAlertEvalRequest,
    AgentAlertEvalResponse,
    ConversationCreate,
    ConversationSummary,
    ConversationDetail,
    ConversationListResponse,
    MessageCreate,
    MessageOut,
)
from .service import query_llm, evaluate_alert_auto
from .db_service import (
    build_system_context,
    get_measurements_by_station,
    create_alert,
    get_station_by_id,
    create_conversation,
    list_conversations,
    get_conversation,
    update_conversation_title,
    delete_conversation,
    add_message,
    get_messages,
)
from .config import OPENROUTER_API_KEY

router = APIRouter(
    prefix="/agent",
    tags=["AI Agent"],
)


# ─── Status ────────────────────────────────────────────────────────────────────

@router.get("/status")
def agent_status():
    return {
        "status": "operational",
        "provider": "openrouter",
        "configured": bool(OPENROUTER_API_KEY),
    }


# ─── Query (with persistence) ─────────────────────────────────────────────────

@router.post("/query", response_model=AgentQueryResponse)
async def agent_query(req: AgentQueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="La pregunta no puede estar vacía.")

    # Create conversation if needed
    conv_id = req.conversation_id
    if conv_id is None and req.session_id:
        conv = create_conversation(req.session_id)
        conv_id = conv["id"]

    # Save user message
    msg_id = None
    if conv_id:
        add_message(conv_id, "user", req.question, source="user")

    # Get LLM answer
    answer = await query_llm(req.question)

    # Save assistant message
    if conv_id:
        msg = add_message(
            conv_id,
            "assistant",
            answer,
            source="llm",
            metadata_json={"conversation_id": str(conv_id)},
        )
        msg_id = msg["id"]

        # Auto-title: use first question as title
        conv = get_conversation(conv_id)
        if conv and conv["message_count"] <= 1:
            title = req.question[:80]
            if len(req.question) > 80:
                title += "..."
            update_conversation_title(conv_id, title)

    return AgentQueryResponse(
        answer=answer,
        conversation_id=conv_id,
        message_id=msg_id,
        source="llm",
    )


# ─── Context ───────────────────────────────────────────────────────────────────

@router.post("/context", response_model=AgentContextResponse)
def agent_context(req: AgentContextRequest):
    context = build_system_context(station_id=req.station_id)
    return AgentContextResponse(
        stations=context["stations"],
        alerts=context["alerts"],
        latest_measurements=context["latest_measurements"],
    )


# ─── Alert evaluation ──────────────────────────────────────────────────────────

@router.post("/evaluate-alert", response_model=AgentAlertEvalResponse)
def evaluate_alert(req: AgentAlertEvalRequest):
    station = get_station_by_id(req.station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Estación no encontrada.")

    measurements = get_measurements_by_station(req.station_id, limit=50)
    result = evaluate_alert_auto(req.station_id, measurements)

    if req.mode == "ai" and result["should_alert"]:
        created = create_alert(
            station_id=req.station_id,
            level=result["severity"],
            message=result["message"],
        )
        result["alert_id"] = created["id"]

    return AgentAlertEvalResponse(**result)


@router.get("/stations")
def agent_stations():
    from .db_service import get_all_stations
    return get_all_stations()


# ─── Conversations CRUD ──────────────────────────────────────────────────────

@router.post("/conversations", response_model=ConversationSummary)
def api_create_conversation(req: ConversationCreate):
    conv = create_conversation(req.session_id, req.title)
    return ConversationSummary(**conv)


@router.get("/conversations", response_model=ConversationListResponse)
def api_list_conversations(
    session_id: str = Query(...),
    limit: int = Query(50, le=100),
):
    convs = list_conversations(session_id, limit)
    return ConversationListResponse(conversations=convs, total=len(convs))


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def api_get_conversation(conversation_id: int):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return ConversationDetail(**conv)


@router.patch("/conversations/{conversation_id}/title", response_model=ConversationSummary)
def api_update_conversation_title(conversation_id: int, title: str = Query(...)):
    updated = update_conversation_title(conversation_id, title)
    if not updated:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return ConversationSummary(**updated)


@router.delete("/conversations/{conversation_id}")
def api_delete_conversation(conversation_id: int):
    deleted = delete_conversation(conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversación no encontrada.")
    return {"ok": True}


# ─── Messages ──────────────────────────────────────────────────────────────────

@router.post("/messages", response_model=MessageOut)
def api_add_message(req: MessageCreate):
    msg = add_message(
        conversation_id=req.conversation_id,
        role=req.role,
        content=req.content,
        source=req.source,
        metadata_json=req.metadata_json,
    )
    return MessageOut(**msg)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def api_get_messages(conversation_id: int, limit: int = Query(100, le=200)):
    msgs = get_messages(conversation_id, limit)
    return [MessageOut(**m) for m in msgs]
