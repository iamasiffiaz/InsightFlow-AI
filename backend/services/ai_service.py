"""OpenAI-compatible LLM service with context-aware mock fallbacks."""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

from config import get_settings

THEME_KEYWORDS = {
    "pricing": ["price", "pricing", "cost", "cheap", "expensive", "plan", "billing", "subscription"],
    "onboarding": ["onboard", "setup", "activation", "first week", "time-to", "getting started"],
    "churn": ["churn", "cancel", "retention", "leave", "drop off", "renew"],
    "sales": ["pipeline", "deal", "sales", "crm", "outbound", "close", "demo"],
    "marketplace": ["provider", "supply", "demand", "booking", "payout", "marketplace"],
    "feedback": ["feedback", "interview", "customer said", "survey", "nps", "review"],
    "growth": ["growth", "acquire", "channel", "marketing", "traffic", "viral"],
    "product": ["feature", "roadmap", "mvp", "ux", "product", "ship"],
    "ops": ["ops", "process", "manual", "bottleneck", "handoff", "sla"],
}


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


async def _call_llm(system_prompt: str, user_prompt: str) -> dict[str, Any] | None:
    settings = get_settings()
    if not settings.has_ai_key:
        return None

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.openai_model,
        "temperature": 0.4,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.openai_base_url.rstrip('/')}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return _extract_json(content)
    except Exception:
        return None


def _join_list(items: list[str] | str) -> str:
    if isinstance(items, str):
        return items
    return "\n".join(f"• {item}" for item in items)


def _detect_themes(text: str) -> list[str]:
    lower = text.lower()
    found = [theme for theme, words in THEME_KEYWORDS.items() if any(w in lower for w in words)]
    return found[:3] or ["product"]


def _excerpt(text: str, limit: int = 140) -> str:
    cleaned = " ".join(text.strip().split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[: limit - 1].rstrip() + "…"


def _priority_from_text(text: str, themes: list[str]) -> str:
    lower = text.lower()
    if any(w in lower for w in ("urgent", "critical", "blocker", "losing", "churn", "asap")):
        return "High"
    if "pricing" in themes or "churn" in themes or "sales" in themes:
        return "High"
    if "ops" in themes or "feedback" in themes:
        return "Medium"
    return "Medium"


def _mock_insight(input_text: str, project_context: dict[str, Any] | None) -> dict[str, str]:
    project_name = (project_context or {}).get("name", "your venture")
    business_type = (project_context or {}).get("business_type", "startup")
    goal = (project_context or {}).get("goal", "grow with focus")
    themes = _detect_themes(input_text)
    snippet = _excerpt(input_text)
    priority = _priority_from_text(input_text, themes)

    theme_insights = {
        "pricing": (
            "Buyers are reacting to packaging clarity more than absolute price — simplify plans before discounting.",
            "Run a 2-tier packaging test with a clear recommended plan and measure close rate.",
            "Discount-led acquisition can train customers to wait for deals and erode willingness to pay.",
        ),
        "onboarding": (
            "Activation friction in the first session is suppressing conversion from signup to meaningful usage.",
            "Ship a guided first-run checklist that gets users to one 'aha' moment in under 10 minutes.",
            "If setup remains ambiguous, paid trials will convert poorly even with strong top-of-funnel.",
        ),
        "churn": (
            "Retention risk shows up before cancelation — early usage drop and unanswered support themes are leading indicators.",
            "Create a save playbook for at-risk accounts with a founder outreach template.",
            "Ignoring early churn signals will inflate CAC payback and distort growth metrics.",
        ),
        "sales": (
            "Pipeline notes suggest deals stall when value is explained as features instead of outcomes.",
            "Standardize a discovery → insight → proposal flow and track stage conversion weekly.",
            "Without a repeatable sales narrative, close rates will stay founder-dependent.",
        ),
        "marketplace": (
            "Marketplace health depends on density and trust more than new feature volume.",
            "Prioritize supply coverage and payout reliability in the densest launch zone first.",
            "Broad consumer spend before supply density creates a cold-start death spiral.",
        ),
        "feedback": (
            "Customer language in the notes is more specific than current product messaging.",
            "Turn recurring phrases into homepage copy and roadmap themes this sprint.",
            "Collecting feedback without owners assigned leaves insight as archive instead of action.",
        ),
        "growth": (
            "Acquisition appears opportunistic; a single primary channel would improve learning speed.",
            "Pick one ICP channel and run a 14-day experiment with a clear success metric.",
            "Spreading budget across unmeasured channels will hide what actually works.",
        ),
        "product": (
            "The notes point to a thin, high-value workflow that should stay protected from scope creep.",
            "Define a 'must-ship' slice tied directly to the project goal and defer adjacent asks.",
            "Feature sprawl will slow release cadence and confuse early adopters.",
        ),
        "ops": (
            "Decision latency between analysis and execution is costing weekly momentum.",
            "Institute a Monday ritual: insight review → owned tasks → Friday demo.",
            "Manual handoffs without owners create invisible WIP and missed deadlines.",
        ),
    }

    primary = themes[0]
    insight, opportunity, risk = theme_insights.get(primary, theme_insights["product"])
    secondary = themes[1] if len(themes) > 1 else "execution"

    return {
        "summary": (
            f"For {project_name} ({business_type}), the notes center on {', '.join(themes)}. "
            f"Quoted signal: \"{snippet}\" — this maps directly to the stated goal: {goal}. "
            f"The highest-leverage move is to convert this theme into one owned experiment and "
            f"2–3 dated tasks before expanding scope."
        ),
        "key_insights": _join_list(
            [
                insight,
                f"Secondary theme detected: {secondary}. Pair it with the primary theme so work stays coherent.",
                f"Language in the source notes is concrete enough to brief a teammate without another meeting.",
                f"Priority should stay {priority} until the next checkpoint proves or kills the hypothesis.",
            ]
        ),
        "opportunities": _join_list(
            [
                opportunity,
                "Package the finding as a one-page brief for investors or advisors to accelerate alignment.",
                "Reuse customer phrasing from the input as marketing and sales talk tracks.",
                "Link the insight to a dashboard KPI so progress is visible week over week.",
            ]
        ),
        "risks": _join_list(
            [
                risk,
                "Acting on a single anecdote without a second validating signal can mis-prioritize the roadmap.",
                "Leaving next actions unowned will recreate the original note-pile problem.",
                "Over-automating before the workflow is clear can produce polished but irrelevant AI output.",
            ]
        ),
        "next_actions": _join_list(
            [
                f"Write a one-sentence hypothesis for {project_name} based on: {snippet}",
                f"Schedule a 30-minute review to assign owners for the top 3 actions this week.",
                f"Capture 3 more data points on the '{primary}' theme before expanding scope.",
                "Convert this insight into tasks and set a date for the next go/no-go check.",
            ]
        ),
        "priority_level": priority,
    }


async def generate_business_insight(
    input_text: str, project_context: dict[str, Any] | None = None
) -> dict[str, str]:
    context = ""
    if project_context:
        context = (
            f"Project: {project_context.get('name')} | "
            f"Type: {project_context.get('business_type')} | "
            f"Goal: {project_context.get('goal')}"
        )

    system = (
        "You are InsightFlow AI, a senior startup advisor. "
        "Return JSON with keys: summary, key_insights (array), opportunities (array), "
        "risks (array), next_actions (array), priority_level (Low|Medium|High). "
        "Ground every bullet in the user's input. Be specific and actionable."
    )
    user = f"Context: {context or 'General business'}\n\nBusiness input:\n{input_text}"

    result = await _call_llm(system, user)
    if result:
        return {
            "summary": result.get("summary", ""),
            "key_insights": _join_list(result.get("key_insights", [])),
            "opportunities": _join_list(result.get("opportunities", [])),
            "risks": _join_list(result.get("risks", [])),
            "next_actions": _join_list(result.get("next_actions", [])),
            "priority_level": result.get("priority_level", "Medium"),
        }

    return _mock_insight(input_text, project_context)


async def generate_business_report(
    project_data: dict[str, Any],
    tasks: list[dict[str, Any]] | None = None,
    insights: list[dict[str, Any]] | None = None,
) -> dict[str, str]:
    tasks = tasks or []
    insights = insights or []

    system = (
        "You are InsightFlow AI writing an investor-ready business report. "
        "Return JSON with keys: title, executive_summary, market_opportunity, "
        "product_recommendations, growth_suggestions, operational_improvements, next_steps. "
        "Use numbered or bulleted text. Be concrete for early-stage teams."
    )
    user = json.dumps(
        {"project": project_data, "tasks": tasks[:10], "insights": insights[:5]},
        default=str,
    )

    result = await _call_llm(system, user)
    if result:
        return {
            "title": result.get("title", f"{project_data.get('name', 'Project')} Business Report"),
            "executive_summary": result.get("executive_summary", ""),
            "market_opportunity": result.get("market_opportunity", ""),
            "product_recommendations": result.get("product_recommendations", ""),
            "growth_suggestions": result.get("growth_suggestions", ""),
            "operational_improvements": result.get("operational_improvements", ""),
            "next_steps": result.get("next_steps", ""),
        }

    name = project_data.get("name", "Project")
    business_type = project_data.get("business_type", "startup")
    goal = project_data.get("goal", "grow sustainably")
    status = project_data.get("status", "Active")
    open_tasks = [t for t in tasks if t.get("status") != "Completed"]
    high_tasks = [t for t in open_tasks if t.get("priority") == "High"]
    completed = [t for t in tasks if t.get("status") == "Completed"]
    latest_insight = insights[0].get("summary", "") if insights else "No prior insights saved yet."

    return {
        "title": f"{name} — Strategic Business Report",
        "executive_summary": (
            f"{name} is a {business_type} initiative currently marked {status}. "
            f"North-star goal: {goal}.\n\n"
            f"Execution snapshot: {len(tasks)} tracked tasks "
            f"({len(open_tasks)} open, {len(high_tasks)} high-priority, {len(completed)} completed). "
            f"{len(insights)} AI insight(s) are on file. Latest signal: {_excerpt(latest_insight, 160)}\n\n"
            f"This report prioritizes a beachhead ICP, a thin product bet, and a 30-day operating rhythm "
            f"so the team converts analysis into owned outcomes."
        ),
        "market_opportunity": (
            f"Buyers in the {business_type} space increasingly pay for speed-to-clarity: fewer tools, "
            f"faster decisions, and measurable ROI inside a quarter.\n\n"
            f"• Wedge: own one painful workflow for one ICP before expanding horizontally.\n"
            f"• Proof: publish before/after decision latency or activation metrics from early users.\n"
            f"• Timing: teams drowning in notes and dashboards are actively shopping for focused alternatives."
        ),
        "product_recommendations": (
            "1. Protect a thin MVP slice that maps directly to the project goal — defer adjacent feature asks.\n"
            "2. Ship an insight → recommendation → task loop so users leave with owned next steps.\n"
            "3. Add project-scoped reports with exportable executive summaries for advisors and boards.\n"
            "4. Keep onboarding under two minutes: sample data + one-click first insight."
        ),
        "growth_suggestions": (
            "• Run founder-led outreach to 40–50 ICP accounts with a concrete ROI hook.\n"
            "• Offer a fixed-scope pilot (2 weeks) that produces a board-ready report as the deliverable.\n"
            "• Publish 1–2 case narratives showing decision speed before vs after InsightFlow-style workflows.\n"
            "• Partner with agencies/advisors who already collect client notes and need faster synthesis."
        ),
        "operational_improvements": (
            f"• Cap WIP: no more than 3 High-priority tasks in progress for {name}.\n"
            "• Weekly ritual: review insights → refresh recommendations → assign owners → Friday check-in.\n"
            "• Track one north-star KPI and one leading indicator; ignore vanity charts.\n"
            f"• Close or re-scope the {len(high_tasks)} high-priority open task(s) before adding new initiatives."
        ),
        "next_steps": (
            f"1. Confirm ICP and success metric for {name} within 7 days.\n"
            f"2. Resolve or re-scope the {len(high_tasks)} high-priority open tasks.\n"
            "3. Generate a fresh insight pack from the latest customer conversations.\n"
            "4. Convert the top recommendation into an owned, dated task.\n"
            "5. Schedule a 30-day checkpoint against the primary KPI."
        ),
    }


async def generate_recommendations(
    projects: list[dict[str, Any]],
    tasks: list[dict[str, Any]],
    reports: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    system = (
        "You are InsightFlow AI. Return JSON with key 'recommendations' as an array of objects "
        "with title, description, category, priority (Low|Medium|High), related_project_id (nullable). "
        "Base suggestions on the supplied portfolio state."
    )
    user = json.dumps(
        {"projects": projects[:10], "tasks": tasks[:20], "reports": reports[:5]},
        default=str,
    )

    result = await _call_llm(system, user)
    if result and isinstance(result.get("recommendations"), list):
        return result["recommendations"][:8]

    active = [p for p in projects if p.get("status") == "Active"]
    stalled = [p for p in projects if p.get("status") in ("Planning", "Paused")]
    completed_projects = [p for p in projects if p.get("status") == "Completed"]
    overdue_style = [t for t in tasks if t.get("status") == "Pending" and t.get("priority") == "High"]
    in_progress = [t for t in tasks if t.get("status") == "In Progress"]
    primary = active[0] if active else (projects[0] if projects else None)
    primary_id = primary.get("id") if primary else None

    recs = [
        {
            "title": "Convert high-priority pending work into a weekly sprint",
            "description": (
                f"You have {len(overdue_style)} high-priority pending task(s) and "
                f"{len(in_progress)} in progress. Group the top items into a focused weekly sprint "
                "with owners, demo criteria, and a Friday review."
            ),
            "category": "Execution",
            "priority": "High",
            "related_project_id": primary_id,
        },
        {
            "title": "Activate stalled projects with a 14-day validation plan",
            "description": (
                f"{len(stalled)} project(s) are still in Planning/Paused. "
                "For each, define a thin validation experiment with a clear kill/continue decision."
            ),
            "category": "Strategy",
            "priority": "High",
            "related_project_id": stalled[0].get("id") if stalled else primary_id,
        },
        {
            "title": "Turn the latest report into an action checklist",
            "description": (
                f"You have {len(reports)} saved report(s). Extract next steps into dated tasks "
                "so recommendations do not remain unread documents."
            ),
            "category": "Operations",
            "priority": "Medium",
            "related_project_id": reports[0].get("project_id") if reports else primary_id,
        },
        {
            "title": "Instrument one north-star metric per active project",
            "description": (
                f"{len(active)} active project(s) move faster when teams share a single measurable "
                "outcome (activation rate, pilot close rate, or time-to-insight)."
            ),
            "category": "Growth",
            "priority": "Medium",
            "related_project_id": primary_id,
        },
        {
            "title": "Create a weekly insight cadence from customer conversations",
            "description": (
                "Schedule a recurring flow: capture notes → generate AI insight → review risks → "
                "spawn tasks. Consistency compounds decision quality across the portfolio."
            ),
            "category": "Product",
            "priority": "Medium",
            "related_project_id": primary_id,
        },
    ]

    if completed_projects:
        recs.append(
            {
                "title": "Harvest playbooks from completed projects",
                "description": (
                    f"{completed_projects[0].get('name')} is completed — extract reusable templates "
                    "(ICP brief, insight prompts, report outline) for the next initiative."
                ),
                "category": "Operations",
                "priority": "Low",
                "related_project_id": completed_projects[0].get("id"),
            }
        )

    return recs


async def generate_task_suggestions(project_data: dict[str, Any]) -> list[dict[str, Any]]:
    system = (
        "Return JSON with key 'tasks' as an array of objects with title, description, priority. "
        "Make tasks specific to the project goal and business type."
    )
    user = json.dumps({"project": project_data}, default=str)

    result = await _call_llm(system, user)
    if result and isinstance(result.get("tasks"), list):
        return result["tasks"][:5]

    name = project_data.get("name", "Project")
    business_type = project_data.get("business_type", "startup")
    goal = project_data.get("goal", "validate and grow")
    goal_short = _excerpt(str(goal), 90)

    return [
        {
            "title": f"Define ICP and success metric for {name}",
            "description": (
                f"Write a one-page ICP profile for this {business_type} bet and choose a single "
                f"KPI aligned to: {goal_short}"
            ),
            "priority": "High",
        },
        {
            "title": "Collect 5 customer feedback notes",
            "description": (
                "Interview or survey early users this week, then paste notes into the Insight Generator "
                "to produce a prioritized action set."
            ),
            "priority": "High",
        },
        {
            "title": f"Ship a thin validation slice for {name}",
            "description": (
                f"Identify the smallest deliverable that tests progress against: {goal_short}. "
                "Document acceptance criteria before building."
            ),
            "priority": "High",
        },
        {
            "title": "Draft a 90-day milestone plan",
            "description": "Break the project goal into monthly milestones with owners and review dates.",
            "priority": "Medium",
        },
        {
            "title": "Generate an AI business report for leadership",
            "description": "Run the report generator after the next insight batch and share next steps with stakeholders.",
            "priority": "Medium",
        },
    ]
