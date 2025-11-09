PYTHON ?= python3
MANAGE = $(PYTHON) manage.py

.PHONY: install migrate runserver test format lint check

install:
	$(PYTHON) -m pip install -r requirements.txt

migrate:
	$(MANAGE) migrate

runserver:
	$(MANAGE) runserver 0.0.0.0:8000

test:
	pytest --cov=vbconnect --cov-report=term-missing

format:
	isort .
	black .

lint:
	black --check .
	isort --check-only .

check:
	$(MANAGE) check
