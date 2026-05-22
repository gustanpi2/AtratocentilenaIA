"""
Telegram message formatter — AtratoCentinela AI
Modern, professional emergency alert formatting with clear visual hierarchy.
"""

from datetime import datetime

SEVERITY_STYLES = {
    "critical": {
        "icon": "🚨",
        "title": "ALERTA CRÍTICA",
        "severity_tag": "🔴 SEVERIDAD: CRÍTICA",
        "threshold": "⚠️ Umbral crítico superado",
    },
    "warning": {
        "icon": "🟡",
        "title": "ALERTA PREVENTIVA",
        "severity_tag": "🟡 SEVERIDAD: PREVENTIVA",
        "threshold": "⚠️ Umbral de precaución activado",
    },
    "normal": {
        "icon": "🟢",
        "title": "SISTEMA ESTABLE",
        "severity_tag": "🟢 ESTADO: NORMAL",
        "threshold": "✅ Dentro de parámetros normales",
    },
}

SEPARATOR = "─" * 42
SEPARATOR_SHORT = "─" * 24


def format_alert_caption(
    station_name: str,
    station_node: str,
    nivel_value: str,
    connection_status: str,
    risk_level: str,
    recommendation: str,
    lat: float | None = None,
    lng: float | None = None,
) -> str:
    """
    Short, impactful caption for photo alerts.
    Designed to be read instantly.
    """
    now = datetime.now().strftime("%H:%M")
    style = SEVERITY_STYLES.get(risk_level, SEVERITY_STYLES["critical"])

    lines = [
        f"{style['icon']} *{style['title']}* — ATRATOCENTINELA AI",
        f"📡 *{station_name}* ({station_node})",
        f"🌊 *Nivel:* {nivel_value} · {style['severity_tag']}",
        f"🤖 {recommendation}",
        f"🕒 {now} · AtratoCentinela AI",
    ]
    return "\n".join(lines)


def format_full_alert(
    station_name: str,
    station_node: str,
    nivel_value: str,
    connection_status: str,
    risk_level: str,
    recommendation: str,
    lat: float | None = None,
    lng: float | None = None,
) -> str:
    """
    Full text-only alert with modern visual hierarchy.
    Clear blocks: header · station/level · severity · action · signature.
    """
    now = datetime.now().strftime("%H:%M")
    date_str = datetime.now().strftime("%d/%m/%Y")

    style = SEVERITY_STYLES.get(risk_level, SEVERITY_STYLES["critical"])
    severity_label = risk_level.upper()

    coords = ""
    if lat is not None and lng is not None:
        coords = f"📍 {lat:.4f}, {lng:.4f}"
    connection_icon = "🟢" if "en línea" in connection_status.lower() else "🔴"

    lines = [
        f"{style['icon']} *{style['title']}* — *ATRATOCENTINELA AI*",
        SEPARATOR,
        "",
        f"📡 *Estación:* {station_name} ({station_node})",
        f"🌊 *Nivel:* {nivel_value}",
        f"   {style['threshold']}",
        "",
    ]

    if coords:
        lines.append(f"{coords}  ·  {connection_icon} {connection_status}")
    else:
        lines.append(f"{connection_icon} {connection_status}")

    lines += [
        f"🕒 {now} — {date_str}",
        "",
        style["severity_tag"],
        SEPARATOR_SHORT,
        "",
        f"🤖 *Acción inmediata:*",
        recommendation,
        "",
        f"━━━ AtratoCentinela AI · Monitoreo ambiental del río Atrato",
    ]

    return "\n".join(lines)


def format_station_status(
    station_name: str,
    station_node: str,
    risk_level: str,
    connection: str,
    variables: list[dict],
) -> str:
    level_icon = {"critical": "🔴", "warning": "🟡", "normal": "🟢"}
    icon = level_icon.get(risk_level, "⚪")

    var_lines = []
    for v in variables:
        s = "🔴" if v.get("status") == "critical" else "🟡" if v.get("status") == "warning" else "🟢"
        var_lines.append(f"  {s} {v.get('name', '?')}: {v.get('value', '?')} {v.get('unit', '')}")

    return "\n".join([
        f"{icon} *{station_name}* ({station_node})",
        f"   Riesgo: {risk_level.upper()}",
        f"   Conexión: {connection}",
        "",
        "   *Variables:*",
        *var_lines,
    ])


def format_system_status(
    total: int,
    online: int,
    offline: int,
    autonomous: int,
    critical: int,
    stations_detail: str = "",
) -> str:
    lines = [
        "📊 *ESTADO DEL SISTEMA*",
        "",
        f"   🟢 En línea: {online}",
        f"   🟠 Sin conexión: {offline}",
        f"   🟡 Autónomo: {autonomous}",
        f"   🔴 Críticas: {critical}",
        f"   📡 Total: {total}",
        "",
    ]
    if stations_detail:
        lines.append(stations_detail)
        lines.append("")
    lines.append("_AtratoCentinela AI_")
    return "\n".join(lines)


def format_alertas_list(alerts: list[dict]) -> str:
    if not alerts:
        return "✅ *Sin alertas activas*\n\nTodas las estaciones en condiciones normales."

    lines = ["🚨 *ALERTAS ACTIVAS*", ""]
    for a in alerts:
        icon = "🔴" if a.get("level") == "CRITICAL" else "🟡"
        lines.append(f"{icon} *{a.get('station_name', '?')}*")
        lines.append(f"   {a.get('message', '?')}")
        lines.append(f"   🕒 {a.get('triggered_at', '?')}")
        lines.append("")
    return "\n".join(lines)


def format_help() -> str:
    return """🤖 *AtratoCentinela AI*

/estado — Estado del sistema
/alertas — Alertas activas
/estaciones — Lista de estaciones
/help — Ayuda

*Preguntas:* "¿Cómo está el río?",
"Estado de Quibdó", "¿Hay alertas?"

_Solo monitoreo ambiental del río Atrato_"""
