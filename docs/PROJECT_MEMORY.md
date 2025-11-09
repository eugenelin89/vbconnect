# Project Memory

This document is the canonical snapshot of Vancouver Baseball Connect’s mission, current scope, and active workstreams. Update it whenever goals, status, or decisions change so every agent stays aligned.

## Vision & North Star
- Deliver a Django/DRF MVP that lets players, coaches, coordinators, and parents in Vancouver Minor & Community Baseball track development, verify achievements, and manage token rewards.
- Maintain clean boundaries between domain apps (`accounts`, `players`, `teams`, `training`, `achievements`, `tokens`) to keep future mobile/API growth straightforward.

## Current Codebase State (Nov 2025)
- Backend scaffolded under `backend/` with Django 4.2, DRF, drf-spectacular, pytest, and Makefile tooling (`install`, `migrate`, `runserver`, `test`, `format`, `lint`, `check`).
- Custom user model (`accounts.User`) supports roles: player, coach, coordinator, parent, admin; token-based auth endpoints exist (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- Player domain implemented: auto-created profiles, editable via `/api/profile/`, metrics CRUD + coach verification, training logs with verification API, achievements awarding tokens, token transactions with balances.
- Teams/divisions: coaches/coordinators can create teams, players/parents can join, and coordinators approve coaches. Team membership keeps player profiles synced.
- API routing centralized with DRF routers and `/api/docs/` for Swagger UI; Spectacular schema bundled.
- Frontend SPA under `frontend/` (vanilla HTML/CSS/JS) delivers responsive dashboards, handles auth, profile updates, teams, metrics, logs, achievements, token flows, and role-based actions via fetch calls to the API base.
- CORS support configured via `django-cors-headers` with `.env`-driven `CORS_ALLOWED_ORIGINS`, enabling browser clients on `localhost` ports.
- Tests: smoke coverage for registration, player profile update, and coach team creation (pytest). CI not configured yet.
- Docs: `AGENTS.md` (contributor guide), `docs/Vancouver_Baseball_Connect_MVP_PRD.md`, `docs/SETUP.md` (macOS setup guide), and this memory file.

## Active Goals (Q4 2025)
1. Harden access control & audit logging for coach/coordinator actions (verifications, token grants).
2. Expand automated tests (negative cases, tokens, achievements, verification edges) to hit ≥80% coverage per AGENTS guidelines.
3. Define API contracts for mobile client handoff (versioning strategy, rate limits).
4. Prepare deployment infrastructure (Dockerfile, CI workflows, staging environment with Postgres + HTTPS).

## Open Questions / Decisions Needed
- Choose long-term auth strategy (JWT vs session) before mobile rollout; SimpleJWT installed but unused.
- Finalize email/SMS provider and notification delivery approach (currently console backend).
- Decide whether token wallet remains non-redemption for MVP or needs limited redemption logic.
- Determine if we keep `psycopg2-binary` or migrate to `psycopg[binary]` for Postgres 14+ support.

## Next Suggested Actions
1. Add CI workflow (GitHub Actions) running `make lint`, `make test`, and `python manage.py check` on Python 3.12.
2. Implement serializer-level permission tests for training log verification + token awards.
3. Draft API reference for mobile engineers using drf-spectacular output plus narrative docs in `docs/api/`.
4. Introduce seed fixtures or management commands for demo data (players, teams, achievements) to speed stakeholder demos.

Keep this document up to date—if you complete or reprioritize any goal, reflect it here so the next agent knows the true state of play.
