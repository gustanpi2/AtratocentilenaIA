"""
Map snapshot generator for Telegram.
Primary: Google Static Maps API with dark professional style.
No additional dependencies required.
"""

import logging
import math
from typing import Optional

from .config import GOOGLE_MAPS_API_KEY

logger = logging.getLogger(__name__)

STATIC_MAP_BASE = "https://maps.googleapis.com/maps/api/staticmap"

# Professional dark map style for emergency/hydrological monitoring
# First segment intentionally omits "style=" prefix — URL template adds it.
DARK_MAP_STYLE = (
    "feature:all|element:geometry|color:0x1a1a2e"
    "&style=feature:all|element:labels.text.fill|color:0xbbbbbb"
    "&style=feature:all|element:labels.text.stroke|color:0x000000"
    "&style=feature:water|element:geometry|color:0x0f3050"
    "&style=feature:water|element:labels.text.fill|color:0x6699cc"
    "&style=feature:poi|element:geometry|color:0x1e2740"
    "&style=feature:road|element:geometry|color:0x283747"
    "&style=feature:road|element:labels.text.fill|color:0x8a9ba8"
    "&style=feature:administrative|element:geometry|color:0x1a1a2e"
    "&style=feature:administrative|element:labels.text.fill|color:0x8a9ba8"
)


def _compute_circle_points(
    lat: float,
    lng: float,
    radius_km: float = 1.5,
    num_points: int = 16,
) -> list[tuple[float, float]]:
    """Compute points approximating a circle around lat/lng."""
    lat_rad = math.radians(lat)
    dlat = radius_km / 111.0
    dlng = radius_km / (111.0 * abs(math.cos(lat_rad)) + 0.001)

    points = []
    for i in range(num_points):
        angle = 2 * math.pi * i / num_points
        pl = lat + dlat * math.cos(angle)
        plng = lng + dlng * math.sin(angle)
        points.append((pl, plng))
    return points


def build_static_map_url(
    lat: float,
    lng: float,
    station_name: str = "",
    zoom: int = 14,
    width: int = 600,
    height: int = 300,
    severity: str = "critical",
) -> Optional[str]:
    """Build a Google Static Maps URL with dark style, marker, and risk circle.

    Returns None if GOOGLE_MAPS_API_KEY is not configured.
    """
    if not GOOGLE_MAPS_API_KEY:
        logger.warning("[Map] GOOGLE_MAPS_API_KEY is empty — cannot generate map")
        return None

    logger.info(f"[Map] GOOGLE_MAPS_API_KEY loaded (len={len(GOOGLE_MAPS_API_KEY)}) — generating map for {station_name} at {lat},{lng}")

    label = station_name[:1].upper() if station_name else "C"

    # Marker severity colors
    marker_color = {"critical": "red", "warning": "orange", "normal": "green"}.get(severity, "red")
    halo_color = {"critical": "0xef4444", "warning": "0xf59e0b", "normal": "0x22c55e"}.get(severity, "0xef4444")

    # Station marker (large, labeled)
    marker = f"color:{marker_color}|label:{label}|size:large|{lat},{lng}"

    # Risk halo circle (semi-transparent filled path) — use actual pipes, Google API accepts them
    circle_pts = _compute_circle_points(lat, lng, radius_km=1.5)
    path_pts = "|".join(f"{p[0]:.5f},{p[1]:.5f}" for p in circle_pts)
    path_pts += f"|{circle_pts[0][0]:.5f},{circle_pts[0][1]:.5f}"
    halo = f"path=color:{halo_color}|weight:2|fillcolor:{halo_color}33|{path_pts}"

    url = (
        f"{STATIC_MAP_BASE}?"
        f"center={lat},{lng}&"
        f"zoom={zoom}&"
        f"size={width}x{height}&"
        f"scale=2&"
        f"maptype=roadmap&"
        f"markers={marker}&"
        f"{halo}&"
        f"style={DARK_MAP_STYLE}&"
        f"key={GOOGLE_MAPS_API_KEY}"
    )

    logger.info(f"[Map] URL generated ({len(url)} chars)")
    logger.debug(f"[Map] Full URL: {url[:300]}...")

    return url
