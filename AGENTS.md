# Repository Guidelines

## Project Structure & Module Organization
Keep `Vancouver_Baseball_Connect_MVP_PRD.md` in `docs/` as the product source of truth. Place Django code in `backend/`, with the project config under `backend/vbconnect/` and each domain-specific app (`players`, `teams`, `tokens`, `achievements`) inside `backend/apps/`. Store static assets in `backend/static/` and templates in `backend/templates/`. Each app should include its own `tests/` package plus `serializers.py`, `views.py`, and `routers.py` to match the REST layout described in the PRD. The responsive SPA lives under `frontend/` (vanilla HTML/CSS/JS) and is served statically (e.g., `python -m http.server`); keep shared UI logic in `app.js` and styling in `styles.css`.

## Build, Test, and Development Commands
```
python -m venv .venv && source .venv/bin/activate  # create/enter env
pip install -r requirements.txt                   # install Django, DRF, pytest
python manage.py migrate                          # apply PostgreSQL schema
python manage.py runserver                        # run local server on :8000
pytest                                            # run app-level tests
python manage.py check                            # validate model/config integrity
# Serve frontend (from repo root):
#   cd frontend && python -m http.server 5173
```
Run commands from `backend/`, and export `DATABASE_URL` plus email credentials before migrations. Update `CORS_ALLOWED_ORIGINS` in `.env` whenever the frontend runs from a new host/port so browser requests succeed.

## Coding Style & Naming Conventions
Target Python 3.12 with Black (line length 100) and isort; run `make format` if provided. Follow DRF best practices: `snake_case` for modules/functions, `PascalCase` for Django models/serializers, and `camelCase` keys in JSON responses. Keep views slim by delegating logic to services under `backend/apps/<app>/services.py`. Tailwind utility classes belong in templates, while reusable components go into `frontend/` if/when React clients land.

## Testing Guidelines
Write pytest suites per app (`backend/apps/players/tests/test_profile_api.py`). Mirror user stories from the PRD: verification flows, token balances, and role-based permissions all need positive and negative tests. Maintain ≥80% coverage using `pytest --cov=vbconnect --cov-report=term-missing`, and gate merges on `python manage.py check` plus schema migrations. Snapshot sample payloads in `tests/fixtures/` to keep role dashboards reproducible.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat(teams): add coach approval endpoint`) to make changelog automation straightforward. Every PR should: reference the relevant Trello/Jira issue, summarize the change set, list verification steps (`pytest`, `migrate`), and include screenshots for template/UI tweaks. Never commit `.env` or database dumps; instead, document required variables in `docs/config-example.env`.

## Security & Configuration Tips
Store secrets in `.env` consumed by `django-environ`. Keep the CORS allowlist tight via `CORS_ALLOWED_ORIGINS` (only whitelisted SPA hosts should reach the API) and require HTTPS locally via `DJANGO_SECURE_SSL_REDIRECT=True` before release testing. Limit coordinator/admin actions to staff-only DRF viewsets and double-check permissions with integration tests covering each role listed in the PRD. Keep migration files reviewed to prevent accidental data exposure.
