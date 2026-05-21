import json
from datetime import datetime

import httpx

from .config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    OPENROUTER_MODEL,
    OPENROUTER_TIMEOUT,
    AGENT_SYSTEM_PROMPT,
)
from .db_service import build_system_context


# ─── Cooldown tracker for auto-alerts ─────────────────────────────────────────

_alert_cooldowns: dict[str, datetime] = {}
COOLDOWN_MINUTES = 12


def _check_cooldown(station_id: int, variable: str) -> int | None:
    key = f"{station_id}_{variable}"
    last = _alert_cooldowns.get(key)
    if last:
        elapsed = (datetime.utcnow() - last).total_seconds() / 60
        if elapsed < COOLDOWN_MINUTES:
            remaining = int(COOLDOWN_MINUTES - elapsed)
            return remaining
    return None


def _set_cooldown(station_id: int, variable: str):
    key = f"{station_id}_{variable}"
    _alert_cooldowns[key] = datetime.utcnow()


# ─── OpenRouter LLM call ──────────────────────────────────────────────────────

DOMAIN_KEYWORDS = [
    "rio", "atrato", "agua", "nivel", "caudal", "ph", "turbiedad",
    "temperatura", "oxigeno", "conductividad", "precipitacion", "lluvia",
    "estacion", "sensor", "variable", "alerta", "riesgo", "inundacion",
    "monitoreo", "prediccion", "historial", "medicion", "lectura",
    "quibdo", "bojaya", "vigia", "tutunendo", "lloro", "cuenca",
    "hidrologico", "ambiental", "nodo", "critico",
]


def _is_domain_question(question: str) -> bool:
    q = question.lower()
    for kw in DOMAIN_KEYWORDS:
        if kw in q:
            return True
    return False


def _build_context_prompt(context: dict) -> str:
    parts = []
    alerts = context.get("alerts", [])
    measurements = context.get("latest_measurements", [])

    # Status summary header — explicitly tells the LLM the current state
    if alerts:
        critical = [a for a in alerts if a.get("level") == "CRITICAL"]
        warning = [a for a in alerts if a.get("level") in ("WARNING", "HIGH")]
        status_parts = []
        if critical:
            status_parts.append(f"HAY {len(critical)} ALERTA(S) CRITICA(S) ACTIVA(S)")
        if warning:
            status_parts.append(f"HAY {len(warning)} ALERTA(S) PREVENTIVA(S) ACTIVA(S)")
        status_parts.append("Las siguientes estaciones presentan condiciones anormales:")
        parts.append("=== ESTADO ACTUAL DEL SISTEMA ===\n" + "\n".join(status_parts))
    else:
        parts.append(
            "=== ESTADO ACTUAL DEL SISTEMA ===\n"
            "NO HAY ALERTAS ACTIVAS. Todas las estaciones se encuentran en condiciones normales."
        )

    if measurements:
        meas_str = "\n".join(
            f"  - {m['station_name']} | {m['variable_name']}: {m['value']} {m['unit']} "
            f"(medido: {m['measured_at']})"
            for m in measurements[:30]
        )
        parts.append(f"MEDICIONES RECIENTES (últimas 24h):\n{meas_str}")
    else:
        parts.append(
            "MEDICIONES RECIENTES:\nNo hay mediciones disponibles en este momento. "
            "Las condiciones del río se consideran estables dentro de rangos normales."
        )

    if context.get("stations"):
        stations_str = "\n".join(
            f"  - {s['name']} (código: {s['code']}, "
            f"ubicación: {s.get('latitude', '?')}, {s.get('longitude', '?')})"
            for s in context["stations"]
        )
        parts.append(f"ESTACIONES DISPONIBLES:\n{stations_str}")

    if alerts:
        alerts_str = "\n".join(
            f"  - [{a['level']}] {a['station_name']}: {a['message']} "
            f"({a['triggered_at']})"
            for a in alerts
        )
        parts.append(f"DETALLE DE ALERTAS ACTIVAS:\n{alerts_str}")

    return "\n\n".join(parts)


async def query_llm(question: str) -> str:
    if not OPENROUTER_API_KEY:
        return (
            "El agente IA no está configurado. "
            "El administrador debe agregar OPENROUTER_API_KEY en el archivo .env del backend."
        )

    domain_check = _is_domain_question(question)
    context = build_system_context() if domain_check else {}

    context_block = _build_context_prompt(context) if domain_check else ""

    if not domain_check:
        context_block = (
            "NOTA: Esta pregunta no parece relacionada con el monitoreo ambiental del río Atrato. "
            "Responde educadamente que solo puedes ayudar con el sistema AtratoCentinela AI."
        )

    messages = [
        {"role": "system", "content": AGENT_SYSTEM_PROMPT},
    ]

    if context_block:
        messages.append({
            "role": "system",
            "content": f"DATOS ACTUALES DEL SISTEMA:\n{context_block}",
        })

    messages.append({"role": "user", "content": question})

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://atratocentinela.ai",
        "X-Title": "AtratoCentinela AI Agent",
    }

    async with httpx.AsyncClient(timeout=OPENROUTER_TIMEOUT) as client:
        try:
            resp = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except httpx.TimeoutException:
            return "Lo siento, el servicio de IA no respondió a tiempo. Intenta de nuevo."
        except Exception as e:
            return f"Error al consultar la IA: {str(e)}"


# ─── Alert evaluation ─────────────────────────────────────────────────────────

THRESHOLDS = {
    "Nivel del rio": {"warning": 5.0, "critical": 6.5},
    "Turbiedad": {"warning": 100, "critical": 200},
    "pH": {"warning": 9.0, "critical": 9.5},
    "Conductividad": {"warning": 400, "critical": 600},
    "Oxigeno disuelto": {"warning": 4.0, "critical": 2.0},
    "Temperatura": {"warning": 32, "critical": 35},
    "Precipitacion 24h": {"warning": 80, "critical": 150},
}


def evaluate_alert_auto(
    station_id: int,
    measurements: list[dict],
) -> dict:
    """Evaluate whether measurements warrant an automatic alert in AI mode."""

    exceeding_critical = []
    exceeding_warning = []

    for m in measurements:
        var_name = m.get("variable_name", "")
        value = m.get("value", 0)
        thresholds = THRESHOLDS.get(var_name)
        if not thresholds:
            continue

        if value >= thresholds["critical"]:
            exceeding_critical.append(m)
        elif value >= thresholds["warning"]:
            exceeding_warning.append(m)

    result = {
        "should_alert": False,
        "severity": None,
        "message": None,
        "reason": None,
        "cooldown_remaining": None,
    }

    if exceeding_critical:
        primary = exceeding_critical[0]
        cooldown = _check_cooldown(station_id, primary.get("variable_name", ""))
        if cooldown is not None:
            result["cooldown_remaining"] = cooldown
            result["reason"] = f"Cooldown activo para {primary.get('variable_name', '')}"
            return result

        _set_cooldown(station_id, primary.get("variable_name", ""))
        result["should_alert"] = True
        result["severity"] = "CRITICAL"
        result["message"] = (
            f"{primary.get('variable_name', 'Variable')} supera umbral crítico "
            f"({primary.get('value', '?')} {primary.get('unit', '')})"
        )
        return result

    if len(exceeding_warning) >= 2:
        primary = exceeding_warning[0]
        cooldown = _check_cooldown(station_id, primary.get("variable_name", ""))
        if cooldown is not None:
            result["cooldown_remaining"] = cooldown
            result["reason"] = f"Cooldown activo para {primary.get('variable_name', '')}"
            return result

        _set_cooldown(station_id, primary.get("variable_name", ""))
        result["should_alert"] = True
        result["severity"] = "WARNING"
        result["message"] = (
            f"{len(exceeding_warning)} variables en rango preventivo "
            f"en estación {station_id}. Monitoreo intensificado."
        )
        return result

    result["reason"] = "Ninguna variable supera umbrales críticos."
    return result
