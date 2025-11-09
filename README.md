# Vancouver Baseball Connect MVP

Vancouver Baseball Connect is a role-aware development platform for minor & community baseball organizations. Players, coaches, coordinators, and parents collaborate around verified stats, training logs, achievements, and a lightweight token economy. This MVP anchors the product vision with a Django REST backend, a responsive web client, and project documentation tailored for multi-agent contributors.

<p align="center">
  <img src="docs/assets/hero-placeholder.png" alt="VBC hero mock" width="640" />
</p>

## Why It Matters
- **Every stakeholder is represented**: Players showcase verified metrics, coaches manage rosters and approvals, coordinators oversee divisions, and parents stay informed.
- **Verifiable progress**: Training logs, performance metrics, and achievements require coach/coordinator verification, building trust and accountability.
- **Tokenized recognition**: Non-blockchain tokens reward effort and can evolve toward redemption or marketplace features later.
- **API-first mindset**: REST endpoints power web/mobile clients, with drf-spectacular providing a live schema at `/api/docs/`.

## Architecture Overview
| Layer | Tech | Highlights |
| --- | --- | --- |
| Backend | Django 4.2 + DRF | Custom `accounts.User`, domain apps (`players`, `teams`, `training`, `achievements`, `tokens`), `django-environ` config, Spectacular schema |
| Auth | DRF Token Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, role-aware permissions (player/coach/coordinator/parent/admin) |
| Frontend | Vanilla HTML/CSS/JS SPA | Responsive dashboard (panels for auth, profile, teams, metrics, training, achievements, tokens), fetch-based API client with localStorage |
| Testing | pytest + pytest-django | Smoke tests for auth, profile, team creation (expanding toward ≥80% coverage) |
| Tooling | Makefile, `docs/` | `make install/migrate/runserver/test/format/lint/check`, AGENTS guide, setup instructions, project memory |

## Repo Layout
```
.
├── backend/                 # Django project
│   ├── apps/                # Domain apps (accounts, players, teams, etc.)
│   ├── vbconnect/           # Settings, URLs, ASGI/WSGI
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # Static SPA (index.html, styles.css, app.js)
├── docs/
│   ├── Vancouver_Baseball_Connect_MVP_PRD.md
│   ├── SETUP.md             # Local environment walkthrough
│   ├── PROJECT_MEMORY.md    # Living project goals/state
│   └── assets/              # (optional) images/mockups
├── AGENTS.md                # Contributor guide for agents
└── README.md
```

## Getting Started
1. **Install Python 3.12 (via Homebrew or pyenv)**  
   ```bash
   brew install python@3.12
   cd /Users/eugenelin/dev/vbconnect/backend
   python3.12 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. **Configure environment**  
   Copy `backend/.env.example` to `.env` and set `SECRET_KEY`, `DATABASE_URL`, `EMAIL_*`, and `CORS_ALLOWED_ORIGINS` (frontend defaults to `http://127.0.0.1:5173`).
3. **Database + server**  
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```
4. **Frontend**  
   ```bash
   cd ../frontend
   python -m http.server 5173
   # Visit http://127.0.0.1:5173 and set API Base to http://127.0.0.1:8000
   ```
5. **Tests & lint**  
   ```bash
   cd ../backend
   source .venv/bin/activate
   pytest
   make lint   # optional; runs black/isort checks
   ```

## Key Features
- **Role-aware dashboards**: UI panels unlock/lock actions depending on auth role (coach vs player vs coordinator).
- **Team + division controls**: Coaches create teams, players/parents join, coordinators approve coaches.
- **Training & metrics workflow**: Players log sessions and submit metrics; coaches verify via `verify` endpoints or the SPA.
- **Achievements & tokens**: Awards trigger token transactions (signals keep wallets accurate).
- **API visibility**: `/api/docs/` offers live Swagger UI; `drf-spectacular` keeps schema in sync with serializers/viewsets.

## Security & Configuration
- Secrets live in `.env` loaded with `django-environ`.
- CORS allowlist (`CORS_ALLOWED_ORIGINS`) ensures only approved frontend origins can call the API.
- Role-based permissions lock privileged actions to coaches/coordinators/admins.
- HTTPS enforcement toggled via `DJANGO_SECURE_SSL_REDIRECT`.

## Roadmap Highlights
- Expand automated tests (negative cases, token/achievement flows) to reach ≥80% coverage.
- Add CI pipelines (black/isort/pytest/migrate).
- Introduce seed fixtures and demo data for quick onboarding.
- Formalize mobile API contracts and document versioning/rate limits.
- Harden notification stack (email/SMS) and deployment (Docker, staging env).

For deeper context, read:
- `docs/Vancouver_Baseball_Connect_MVP_PRD.md` (product requirements)
- `docs/SETUP.md` (step-by-step environment setup)
- `docs/PROJECT_MEMORY.md` (current goals, decisions, next steps)
- `AGENTS.md` (coding conventions + contributor expectations)

Contributions are welcome—open an issue or PR following the Conventional Commits style outlined in AGENTS. Play ball!

