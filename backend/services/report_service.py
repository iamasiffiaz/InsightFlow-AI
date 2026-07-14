"""Report orchestration helpers."""

from __future__ import annotations

from typing import Any

from services import ai_service


async def build_project_report(
    project: dict[str, Any],
    tasks: list[dict[str, Any]],
    insights: list[dict[str, Any]],
) -> dict[str, str]:
    return await ai_service.generate_business_report(project, tasks, insights)
