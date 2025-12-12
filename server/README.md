# AET Request Server

FastAPI backend for the AET Request system.

## Setup

```bash
# Install dependencies
uv sync

# Copy environment file
cp .env.example .env

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn app.main:app --reload
```

## Development

```bash
# Run linter
uv run ruff check .

# Run formatter
uv run ruff format .

# Run tests
uv run pytest
```
