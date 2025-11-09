# Local Setup & Launch

This walkthrough mirrors the exact steps we just followed to get the MVP backend running locally on macOS (Apple Silicon). Adjust paths if your workspace differs.

## 1. Prerequisites
- Homebrew (for installing Python 3.12)
- Git + zsh (default macOS shell)

## 2. Install Python 3.12 (keeps global python untouched)
```bash
brew install python@3.12
# optional: confirm the binary exists
/opt/homebrew/opt/python@3.12/bin/python3.12 --version
```
This adds a new interpreter alongside your existing `python`. Nothing global changes unless you modify `$PATH`.

## 3. Create the project virtual environment
```bash
cd /Users/eugenelin/dev/vbconnect/backend
rm -rf .venv                         # remove any old venv
/opt/homebrew/opt/python@3.12/bin/python3.12 -m venv .venv
source .venv/bin/activate
python --version                     # should show 3.12.x now
```

## 4. Install dependencies
```bash
pip install -r requirements.txt
```
`psycopg2-binary` now installs cleanly because wheels exist for Python 3.12.

## 5. Apply database migrations
```bash
python manage.py migrate
```
(Optional) create an admin user: `python manage.py createsuperuser`.

## 6. Launch the API locally
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000/api/docs/` for Swagger UI, or hit endpoints via curl/Postman.
If you need to expose a different frontend origin, add it to `CORS_ALLOWED_ORIGINS` in `backend/.env`.

## 7. Serve the responsive frontend
Open a second terminal:
```bash
cd /Users/eugenelin/dev/vbconnect/frontend
python -m http.server 5173
```
Then visit `http://127.0.0.1:5173` and set the API base (top-right chip) to `http://127.0.0.1:8000` before logging in. The SPA will store the base URL + auth token in localStorage.

## 8. Run the smoke tests
```bash
pytest
```
Current suite covers registration, player profile updates, and coach team creation.

## 9. Daily workflow recap
1. `cd /Users/eugenelin/dev/vbconnect/backend`
2. `source .venv/bin/activate`
3. Work normally (`python manage.py ...`, `pytest`, `make format`, etc.)
4. `deactivate` when done; global Python stays untouched.

That’s it—you can now build iteratively against the MVP backend without fighting interpreter mismatches.
