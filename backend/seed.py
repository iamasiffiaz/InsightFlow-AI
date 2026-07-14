"""Seed realistic demo data for InsightFlow AI."""

from datetime import date, datetime, timedelta, timezone

from passlib.context import CryptContext

from database import Base, SessionLocal, engine
from models import (
    BusinessSettings,
    Insight,
    Project,
    Recommendation,
    Report,
    Task,
    User,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        user = User(
            email="demo@insightflow.ai",
            full_name="Alex Rivera",
            hashed_password=pwd_context.hash("demo1234"),
            is_active=True,
        )
        db.add(user)
        db.flush()

        settings = BusinessSettings(
            user_id=user.id,
            business_name="Northstar Ventures",
            industry="B2B SaaS",
            default_project_type="SaaS",
            ai_provider="OpenAI Compatible",
            api_key_placeholder="",
            theme="light",
        )
        db.add(settings)

        projects = [
            Project(
                name="PulseCRM Launch",
                business_type="SaaS",
                description=(
                    "Lightweight CRM for early-stage sales teams that need pipeline clarity "
                    "without enterprise complexity."
                ),
                goal="Reach 50 paying teams and $8k MRR within 6 months.",
                status="Active",
                owner_id=user.id,
            ),
            Project(
                name="LocalLoop Marketplace",
                business_type="Marketplace",
                description=(
                    "Two-sided marketplace connecting neighborhood service providers with "
                    "busy homeowners for same-week bookings."
                ),
                goal="Validate supply density in 3 metro areas and hit 200 completed jobs.",
                status="Planning",
                owner_id=user.id,
            ),
            Project(
                name="BrightPath Onboarding",
                business_type="EdTech",
                description=(
                    "AI-assisted employee onboarding toolkit for remote-first startups "
                    "with distributed managers."
                ),
                goal="Reduce new-hire time-to-productivity by 30% for pilot customers.",
                status="Active",
                owner_id=user.id,
            ),
            Project(
                name="LedgerLite Finance Ops",
                business_type="FinTech",
                description=(
                    "Lightweight expense and cash-flow workspace for bootstrapped founders "
                    "who outgrew spreadsheets but do not need full accounting suites."
                ),
                goal="Close a 10-company design partner program and ship invoicing v1.",
                status="Paused",
                owner_id=user.id,
            ),
            Project(
                name="AgencyOS Retainer Pilot",
                business_type="Agency",
                description=(
                    "Internal operating system for a boutique growth agency: client briefs, "
                    "weekly insights, and deliverable tracking in one place."
                ),
                goal="Standardize delivery for 6 retainers and cut status-meeting time by 40%.",
                status="Completed",
                owner_id=user.id,
            ),
        ]
        db.add_all(projects)
        db.flush()

        today = date.today()
        tasks = [
            Task(
                title="Finalize ICP messaging for PulseCRM",
                description="Rewrite homepage hero around pipeline visibility outcomes.",
                project_id=projects[0].id,
                priority="High",
                status="In Progress",
                due_date=today + timedelta(days=5),
                source="manual",
            ),
            Task(
                title="Ship insight-to-task conversion flow",
                description="Allow users to create tasks directly from AI next actions.",
                project_id=projects[0].id,
                priority="High",
                status="Pending",
                due_date=today + timedelta(days=10),
                source="ai",
            ),
            Task(
                title="Interview 8 early CRM churned users",
                description="Capture objections and feature gaps from competitors.",
                project_id=projects[0].id,
                priority="Medium",
                status="Completed",
                due_date=today - timedelta(days=3),
                source="manual",
            ),
            Task(
                title="Map supply partners for LocalLoop Austin",
                description="Recruit 25 providers across cleaning, handyman, and lawn care.",
                project_id=projects[1].id,
                priority="High",
                status="Pending",
                due_date=today + timedelta(days=14),
                source="manual",
            ),
            Task(
                title="Design booking trust checklist",
                description="Define review, insurance, and response-time requirements.",
                project_id=projects[1].id,
                priority="Medium",
                status="In Progress",
                due_date=today + timedelta(days=7),
                source="ai",
            ),
            Task(
                title="Build onboarding checklist templates",
                description="Create role-based day-1 / week-1 / month-1 playbooks.",
                project_id=projects[2].id,
                priority="High",
                status="In Progress",
                due_date=today + timedelta(days=4),
                source="manual",
            ),
            Task(
                title="Pilot with 3 remote startups",
                description="Run 30-day pilots and measure time-to-first-PR / first-ship metrics.",
                project_id=projects[2].id,
                priority="High",
                status="Pending",
                due_date=today + timedelta(days=21),
                source="ai",
            ),
            Task(
                title="Prepare investor update narrative",
                description="Summarize traction, risks, and next bets across the portfolio.",
                project_id=projects[0].id,
                priority="Low",
                status="Pending",
                due_date=today + timedelta(days=18),
                source="manual",
            ),
            Task(
                title="Resume LedgerLite design-partner outreach",
                description="Re-engage paused design partners with a revised invoicing scope.",
                project_id=projects[3].id,
                priority="Medium",
                status="Pending",
                due_date=today + timedelta(days=12),
                source="manual",
            ),
            Task(
                title="Archive AgencyOS playbooks",
                description="Export retainer templates and insight prompts for future agency clients.",
                project_id=projects[4].id,
                priority="Low",
                status="Completed",
                due_date=today - timedelta(days=10),
                source="ai",
            ),
        ]
        db.add_all(tasks)

        insights = [
            Insight(
                project_id=projects[0].id,
                input_text="Sales notes: teams hate complex CRM setup. They want pipeline stages in under 10 minutes.",
                summary=(
                    "PulseCRM's strongest wedge is setup speed and clarity. Buyers compare it against "
                    "bloated tools and will pay for a focused pipeline that is ready the same day."
                ),
                key_insights=(
                    "• Setup time under 10 minutes is a primary buying trigger.\n"
                    "• Pipeline visibility beats feature breadth for early teams.\n"
                    "• Champions are often founding AEs or first sales hires."
                ),
                opportunities=(
                    "• Offer a 1-click sample pipeline for SaaS / services / agencies.\n"
                    "• Position against HubSpot complexity with a migration checklist.\n"
                    "• Package insight digests of stalled deals for weekly standups."
                ),
                risks=(
                    "• Feature parity pressure from larger CRMs.\n"
                    "• Churn if reporting remains too thin after month two.\n"
                    "• Over-customization could recreate complexity."
                ),
                next_actions=(
                    "• Ship sample pipelines and measure activation to first deal created.\n"
                    "• Add stalled-deal insight card on dashboard.\n"
                    "• Interview 5 agencies for vertical messaging."
                ),
                priority_level="High",
                created_at=datetime.now(timezone.utc) - timedelta(days=6),
            ),
            Insight(
                project_id=projects[0].id,
                input_text="Q2 feedback: customers want AI summaries of call notes attached to deals.",
                summary=(
                    "Call-note summarization is a high-intent expansion feature that reinforces "
                    "PulseCRM's insight-led positioning and increases daily active usage."
                ),
                key_insights=(
                    "• Users already paste notes into freeform fields.\n"
                    "• AI summaries would reduce manager review time.\n"
                    "• Natural attachment point for recommendation → task creation."
                ),
                opportunities=(
                    "• Upsell an Insights add-on after core CRM activation.\n"
                    "• Use summaries to auto-suggest next actions per deal.\n"
                    "• Create shareable weekly pipeline brief emails."
                ),
                risks=(
                    "• Hallucinated action items without source citations.\n"
                    "• Privacy concerns for recorded call content.\n"
                    "• Latency during peak review hours."
                ),
                next_actions=(
                    "• Prototype note → summary → task flow.\n"
                    "• Add citation snippets under each insight.\n"
                    "• Draft data retention policy for notes."
                ),
                priority_level="High",
                created_at=datetime.now(timezone.utc) - timedelta(days=4),
            ),
            Insight(
                project_id=projects[1].id,
                input_text="Provider interviews: inconsistent demand and payment delays are top concerns.",
                summary=(
                    "LocalLoop must solve provider trust first: predictable demand windows and "
                    "fast payouts will unlock supply density faster than consumer discounts."
                ),
                key_insights=(
                    "• Supply churn is driven by idle weeks, not commission rates alone.\n"
                    "• Same-week booking is valued when response SLAs are clear.\n"
                    "• Homeowners care about verified reviews more than lowest price."
                ),
                opportunities=(
                    "• Guarantee a minimum weekly lead volume in densest zip codes.\n"
                    "• Offer instant payout for verified completed jobs.\n"
                    "• Build neighborhood ambassador program for early traction."
                ),
                risks=(
                    "• Cold-start imbalance between supply and demand.\n"
                    "• Quality variance damaging brand trust.\n"
                    "• Regulatory friction around home services in some cities."
                ),
                next_actions=(
                    "• Launch Austin density pilot with payout SLA.\n"
                    "• Define provider quality scorecard.\n"
                    "• Cap promotions until supply coverage hits threshold."
                ),
                priority_level="Medium",
                created_at=datetime.now(timezone.utc) - timedelta(days=3),
            ),
            Insight(
                project_id=projects[2].id,
                input_text="Pilot managers say new hires get lost without a single source of onboarding truth.",
                summary=(
                    "BrightPath's core value is reducing ambiguity for remote new hires by "
                    "centralizing checklists, ownership, and progress visibility."
                ),
                key_insights=(
                    "• Managers lose context across Slack threads and docs.\n"
                    "• Time-to-first-meaningful-contribution is the KPI that resonates.\n"
                    "• AI can personalize checklists by role without heavy admin setup."
                ),
                opportunities=(
                    "• Sell to people ops leaders with a 30-day productivity guarantee narrative.\n"
                    "• Integrate with Slack for nudges and completion prompts.\n"
                    "• Offer templates for engineering, sales, and CS roles."
                ),
                risks=(
                    "• Becoming another checklist tool without measurable outcomes.\n"
                    "• Low adoption if managers do not review progress weekly.\n"
                    "• Template quality variance across industries."
                ),
                next_actions=(
                    "• Instrument time-to-first-PR / first-customer-call metrics.\n"
                    "• Build manager weekly digest.\n"
                    "• Package three role templates for pilots."
                ),
                priority_level="High",
                created_at=datetime.now(timezone.utc) - timedelta(days=2),
            ),
            Insight(
                project_id=projects[2].id,
                input_text="Employee survey: 40% felt unclear on success criteria in week one.",
                summary=(
                    "Unclear success criteria in week one is a leading cause of slow ramp. "
                    "BrightPath should force explicit outcome definitions during setup."
                ),
                key_insights=(
                    "• Ambiguity peaks in days 1–7.\n"
                    "• Success criteria are often implicit in managers' heads.\n"
                    "• AI can prompt managers to define outcomes before invites are sent."
                ),
                opportunities=(
                    "• Add required outcome fields before onboarding plans publish.\n"
                    "• Suggest example success criteria by role.\n"
                    "• Surface risk alerts when criteria remain blank after 48 hours."
                ),
                risks=(
                    "• Extra setup friction reducing signup completion.\n"
                    "• Generic criteria that feel check-the-box.\n"
                    "• Ignoring culture and soft onboarding needs."
                ),
                next_actions=(
                    "• Add outcome gate to plan publishing.\n"
                    "• Seed role-specific example criteria.\n"
                    "• Track % of plans with outcomes defined pre-start."
                ),
                priority_level="Medium",
                created_at=datetime.now(timezone.utc) - timedelta(days=1),
            ),
        ]
        db.add_all(insights)

        reports = [
            Report(
                project_id=projects[0].id,
                title="PulseCRM Launch — Strategic Business Report",
                executive_summary=(
                    "PulseCRM is an active SaaS bet targeting early sales teams frustrated by "
                    "complex CRMs. Traction hinges on activation speed, insight-led workflows, "
                    "and converting AI recommendations into owned tasks."
                ),
                market_opportunity=(
                    "SMB CRM buyers continue to seek simpler alternatives. A wedge around "
                    "pipeline clarity + AI deal insights can capture teams graduating from spreadsheets."
                ),
                product_recommendations=(
                    "1) Sample pipelines for faster activation.\n"
                    "2) Note-to-insight-to-task loop.\n"
                    "3) Stalled-deal alerts on the dashboard."
                ),
                growth_suggestions=(
                    "• Founder-led outbound to first sales hires.\n"
                    "• Publish migration guides from Notion/Sheets.\n"
                    "• Offer a 14-day insight pilot with board-ready summary."
                ),
                operational_improvements=(
                    "• Cap WIP on high-priority tasks.\n"
                    "• Weekly insight review ritual.\n"
                    "• Track activation-to-first-deal KPI tightly."
                ),
                next_steps=(
                    "1. Ship sample pipelines.\n"
                    "2. Close high-priority pending product tasks.\n"
                    "3. Run 5 agency interviews.\n"
                    "4. Publish one case narrative."
                ),
                created_at=datetime.now(timezone.utc) - timedelta(days=5),
            ),
            Report(
                project_id=projects[1].id,
                title="LocalLoop Marketplace — Strategic Business Report",
                executive_summary=(
                    "LocalLoop is in planning with a clear cold-start challenge. Provider trust "
                    "and payout reliability must precede aggressive consumer acquisition."
                ),
                market_opportunity=(
                    "Home services marketplaces win locally where density, trust, and response "
                    "time outperform national aggregators."
                ),
                product_recommendations=(
                    "1) Provider quality scorecard.\n"
                    "2) Instant payout for verified jobs.\n"
                    "3) Neighborhood coverage heatmaps."
                ),
                growth_suggestions=(
                    "• Austin density-first launch.\n"
                    "• Ambassador program for early providers.\n"
                    "• Partner with property managers for demand."
                ),
                operational_improvements=(
                    "• Define SLA for booking response.\n"
                    "• Stage promotions behind coverage thresholds.\n"
                    "• Weekly supply health review."
                ),
                next_steps=(
                    "1. Recruit 25 Austin providers.\n"
                    "2. Finalize trust checklist.\n"
                    "3. Set payout SLA.\n"
                    "4. Decide go/no-go density metric."
                ),
                created_at=datetime.now(timezone.utc) - timedelta(days=2),
            ),
            Report(
                project_id=projects[2].id,
                title="BrightPath Onboarding — Strategic Business Report",
                executive_summary=(
                    "BrightPath addresses remote onboarding ambiguity with AI-assisted checklists "
                    "and manager visibility. Pilots should optimize for time-to-productivity."
                ),
                market_opportunity=(
                    "Remote-first companies still stitch onboarding across docs and chat. "
                    "A measurable productivity narrative is differentiated."
                ),
                product_recommendations=(
                    "1) Role templates with required outcomes.\n"
                    "2) Manager weekly digests.\n"
                    "3) Slack nudges for incomplete critical steps."
                ),
                growth_suggestions=(
                    "• Sell 30-day productivity pilots to people ops.\n"
                    "• Publish before/after ramp benchmarks.\n"
                    "• Partner with HR consultants."
                ),
                operational_improvements=(
                    "• Instrument time-to-first-contribution.\n"
                    "• Require outcomes before plan publish.\n"
                    "• Review pilot health weekly."
                ),
                next_steps=(
                    "1. Finalize engineering/sales/CS templates.\n"
                    "2. Start 3 company pilots.\n"
                    "3. Ship manager digest.\n"
                    "4. Define success scorecard."
                ),
                created_at=datetime.now(timezone.utc) - timedelta(days=1),
            ),
        ]
        db.add_all(reports)

        recommendations = [
            Recommendation(
                title="Convert high-priority pending work into a weekly sprint",
                description=(
                    "Several high-priority tasks remain Pending. Group them into a focused sprint "
                    "with owners and demo criteria to restore execution momentum."
                ),
                category="Execution",
                priority="High",
                related_project_id=projects[0].id,
                status="New",
            ),
            Recommendation(
                title="Validate LocalLoop with a density-first Austin pilot",
                description=(
                    "Avoid broad launch. Concentrate supply recruitment and demand partnerships "
                    "in a small set of zip codes until coverage thresholds are met."
                ),
                category="Strategy",
                priority="High",
                related_project_id=projects[1].id,
                status="New",
            ),
            Recommendation(
                title="Instrument time-to-productivity for BrightPath pilots",
                description=(
                    "Define and track a single north-star metric across pilots so AI insights "
                    "and reports stay anchored to business outcomes."
                ),
                category="Product",
                priority="Medium",
                related_project_id=projects[2].id,
                status="New",
            ),
            Recommendation(
                title="Turn report next steps into owned tasks",
                description=(
                    "Three strategic reports already exist. Extract next steps into dated tasks "
                    "so recommendations become operational, not archival."
                ),
                category="Operations",
                priority="Medium",
                related_project_id=projects[0].id,
                status="New",
            ),
            Recommendation(
                title="Establish a weekly insight review ritual",
                description=(
                    "Schedule a recurring flow: capture notes → generate insights → review risks → "
                    "spawn tasks. Consistency compounds decision quality across projects."
                ),
                category="Growth",
                priority="Medium",
                related_project_id=None,
                status="New",
            ),
        ]
        db.add_all(recommendations)

        db.commit()
        print("Seed complete.")
        print("Demo login: demo@insightflow.ai / demo1234")
        print(
            f"Projects: {len(projects)} | Tasks: {len(tasks)} | Insights: {len(insights)} | "
            f"Reports: {len(reports)} | Recommendations: {len(recommendations)}"
        )
        print("Note: seed.py drops and recreates all tables — do not run against production data.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
