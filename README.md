# InsightFlow AI

**Full-stack AI SaaS MVP** for startups, agencies, and small businesses.

InsightFlow AI helps teams turn raw business notes into insights, reports, recommendations, and owned tasks — from one clean dashboard.

---

## Problem it solves

Founders and operators drown in notes, customer feedback, spreadsheets, and half-finished docs. Analysis is manual, recommendations get lost, and execution stalls because insights never become owned tasks.

---

## Business value

InsightFlow AI helps startups and growing businesses turn raw business information into actionable insights. It reduces manual analysis, organizes project decisions, creates AI-powered reports, suggests next steps, and helps teams move faster with a centralized SaaS dashboard.

**What teams gain**

| Outcome | How InsightFlow helps |
| --- | --- |
| Faster decisions | AI summaries + prioritized next actions from notes |
| Cleaner execution | Projects, tasks, and recommendations in one place |
| Better stakeholder updates | Executive reports generated from live project data |
| Lower analysis overhead | Mock or live LLM outputs without rebuilding a stack |
| Portfolio clarity | Dashboard KPIs and charts driven by real database records |

---

## Use cases

### Startups
Validate ideas faster, convert customer interviews into prioritized experiments, and keep founders aligned on one north-star metric per project.

### Small businesses
Centralize initiatives and weekly AI digests so operators spend less time in spreadsheets and more time shipping the next three actions.

### Agencies & consultants
Produce client-ready business reports from discovery notes in minutes, then convert recommendations into delivery tasks with owners and due dates.

---

## Features

- Premium SaaS landing page (hero, value prop, features, use cases, pricing, CTAs)
- JWT-ready authentication (login, register, demo login, Bearer token on API calls)
- Dashboard with live KPIs, charts, and recent activity from PostgreSQL/SQLite
- Project management CRUD (Planning / Active / Paused / Completed)
- AI Insight Generator (summary, insights, opportunities, risks, next actions, priority)
- AI Business Report Generator (executive summary through next steps)
- Task management with filters, status cycling, and AI-suggested tasks
- AI Recommendations based on projects, tasks, and reports
- Reports & analytics with real chart data
- Settings for business profile and AI provider placeholders
- OpenAI-compatible LLM integration with context-aware mock fallback
- Realistic seed data for portfolio demos
- Optional Docker Compose (frontend, backend, PostgreSQL)

---

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Recharts, Axios, React Router |
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL (Docker) or SQLite (local demo default) |
| AI | OpenAI-compatible Chat Completions API |

---

## Screenshots

### Landing page
![InsightFlow AI landing hero](docs/screenshots/01-landing-hero.png)

![Features, use cases, and pricing](docs/screenshots/02-landing-features-pricing.png)

### SaaS dashboard
![Dashboard with live KPIs and charts](docs/screenshots/03-dashboard.png)

### Projects
![Project management board](docs/screenshots/04-projects.png)

### AI Insights
![AI insight generator and saved analyses](docs/screenshots/05-ai-insights.png)

### Reports & analytics
![Reports page with charts and recent reports](docs/screenshots/06-reports.png)

### Tasks
![Task board with filters and priorities](docs/screenshots/07-tasks.png)

### Recommendations
![AI recommendations cards](docs/screenshots/08-recommendations.png)

---

## Folder structure

```text
MVP/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── config.py
│   ├── seed.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py
│   │   ├── projects.py
│   │   ├── insights.py
│   │   ├── reports.py
│   │   ├── tasks.py
│   │   ├── recommendations.py
│   │   └── settings.py
│   └── services/
│       ├── ai_service.py
│       └── report_service.py
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Setup instructions

### 1) Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
python seed.py
uvicorn main:app --reload --port 8000
```

> **Warning:** `seed.py` drops and recreates all tables. Use only for local/demo databases.

API docs: http://127.0.0.1:8000/docs

### 2) Frontend

```bash
cd frontend
npm install
copy .env.example .env   # optional
npm run dev
```

App: http://127.0.0.1:5173

### Demo credentials

- Email: `demo@insightflow.ai`
- Password: `demo1234`
- Or use **One-click demo login**

### Optional: Docker

```bash
docker compose up --build
docker compose exec backend python seed.py
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Postgres: `localhost:5432` (`insightflow` / `insightflow`)

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./insightflow.db` |
| `SECRET_KEY` | JWT signing secret | dev secret |
| `OPENAI_API_KEY` | LLM API key (optional) | empty → mock AI |
| `OPENAI_BASE_URL` | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | Model name | `gpt-4o-mini` |
| `CORS_ORIGINS` | Comma-separated origins | localhost Vite ports |

PostgreSQL example:

```env
DATABASE_URL=postgresql+psycopg2://insightflow:insightflow@localhost:5432/insightflow
```

### Frontend (`frontend/.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base, e.g. `http://127.0.0.1:8000/api` |

---

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health + AI enabled flag |
| `GET` | `/api/dashboard` | Dashboard stats & chart data |
| `POST` | `/api/auth/register` | Register user + JWT |
| `POST` | `/api/auth/login` | Login + JWT |
| `POST` | `/api/auth/mock-login` | Demo login |
| `GET` | `/api/auth/me` | Current user (from JWT) |
| `GET/POST` | `/api/projects` | List / create projects |
| `GET/PUT/DELETE` | `/api/projects/{id}` | Project detail / update / delete |
| `GET/POST` | `/api/tasks` | List / create tasks |
| `PUT/DELETE` | `/api/tasks/{id}` | Update / delete task |
| `POST` | `/api/tasks/suggest/{project_id}` | AI task suggestions |
| `GET` | `/api/insights` | List insights (`?project_id=`) |
| `POST` | `/api/insights/generate` | Generate + save insight |
| `DELETE` | `/api/insights/{id}` | Delete insight |
| `GET` | `/api/reports` | List reports (`?project_id=`) |
| `POST` | `/api/reports/generate` | Generate + save report |
| `DELETE` | `/api/reports/{id}` | Delete report |
| `GET` | `/api/recommendations` | List recommendations |
| `POST` | `/api/recommendations/generate` | Refresh AI recommendations |
| `GET/PUT` | `/api/settings` | Get / update business settings |

---

## AI service

`backend/services/ai_service.py` exposes:

- `generate_business_insight(input_text, project_context)`
- `generate_business_report(project_data, tasks, insights)`
- `generate_recommendations(projects, tasks, reports)`
- `generate_task_suggestions(project_data)`

If `OPENAI_API_KEY` is missing or the provider call fails, the service returns **context-aware mock responses** grounded in the user’s notes and live portfolio counts — so demos always look realistic.

---

## Future improvements

- **Real authentication hardening** — require JWT on every route, refresh tokens, password reset, OAuth
- **Stripe billing** — Starter / Growth / Scale subscriptions with usage meters for AI generations
- **Team management** — multi-tenant workspaces, roles (owner / editor / viewer), invites
- **Production deployment** — managed Postgres, migrations (Alembic), CI/CD, secrets management, CDN frontend
- File uploads (CSV / PDF) for insight generation
- Export reports to PDF / Notion
- Soft deletes, audit logs, and activity notifications
- Vector memory over historical insights for longer-context recommendations

---

## License

MIT
