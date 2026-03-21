# AET Request Server

FastAPI backend for the AET Request system.

## Setup

```bash
uv sync                          # install dependencies
cp .env.example .env             # configure database + Keycloak
uv run alembic upgrade head      # run database migrations
uv run uvicorn request_server.main:app --reload  # start dev server
```

## Development

```bash
# Lint
uv run ruff check .
uv run ruff check . --fix

# Format
uv run ruff format .

# Type check
uv run ty check .

# Tests
uv run pytest
```

## Project Structure

```text
request_server/
├── api/routes/          # FastAPI route handlers
├── core/                # Config (Pydantic Settings), security
├── db/                  # Database session, base model
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic request/response schemas
└── services/
    ├── descriptions/    # Ticket description builders
    └── ticket/          # Ticket system implementations
```

## API Endpoints

| Endpoint | Description |
| -------- | ----------- |
| `GET /health` | Health check |
| `POST /api/v1/requests/vm` | Create VM request |
| `POST /api/v1/requests/vm-access` | Create VM access request |
| `POST /api/v1/requests/artemis` | Create Artemis developer request |
| `POST /api/v1/requests/tum-guest` | Create TUM guest request |
| `POST /api/v1/requests/support` | Create support request |
| `/api/v1/ssh-keys` | SSH key management |
| `/api/v1/external-links` | External links CRUD (admin) |

## Ticket Systems

The server creates tickets in an external tracking system on each request submission. Configured via `TICKET_SYSTEM` env var:

| Value | Description |
| ----- | ----------- |
| `redmine` | Redmine integration |
| `jira` | Jira integration |
| `debug` | Writes JSON to `/tmp/aet-debug-tickets/` |
| `noop` | No-op (logs only) |

### Test Ticket Creation

Create realistic test tickets against a Redmine instance:

```bash
cd server
python -m scripts.test_redmine_tickets [--type vm|vm-access|artemis|tum-guest|all]
```

## Authentication

Keycloak OIDC integration with role-based access control. Set `AUTH_BYPASS=true` for local development without Keycloak.
