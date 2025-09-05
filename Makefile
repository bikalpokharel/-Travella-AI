.PHONY: install train api test
install:
	python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
train:
	python -m src.train
api:
	uvicorn src.api:app --reload
test:
	pytest -q