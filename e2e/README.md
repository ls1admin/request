# E2E Tests

Playwright-based end-to-end tests that exercise all four request forms through the full stack (client + server + database), verifying that submitted form data produces the expected ticket summary, description, and comments.

## Prerequisites

- Node.js
- Docker (for the test PostgreSQL database)
- [uv](https://docs.astral.sh/uv/) (Python package manager, used by the server)

## Setup

```bash
# Install Playwright and dependencies
cd e2e
npm install
npx playwright install chromium webkit

# Install server dependencies (if not already done)
cd ../server
uv sync

# Install client dependencies (if not already done)
cd ../client
npm install
```

## Running the Tests

### 1. Start the test database

The tests require a PostgreSQL instance on port **5433**. Start it with Docker:

```bash
cd e2e
docker compose up -d
```

This creates an ephemeral Postgres container (`tmpfs` — data is lost on stop).

### 2. Run all tests

```bash
npm test
```

Playwright will automatically start the server (port 8009) and client dev server (port 5174) if they are not already running. The server runs database migrations before starting.

### 3. Run specific test files

```bash
# Single form
npx playwright test tests/vm-request.spec.ts

# Multiple forms
npx playwright test tests/artemis-authenticated.spec.ts tests/artemis-anonymous.spec.ts
```

### 4. Run in headed mode (see the browser)

```bash
npm run test:headed
```

### 5. Run with Playwright UI

```bash
npm run test:ui
```

### 6. Debug a specific test

```bash
npm run test:debug
```

## Starting Servers Manually

If you prefer to start the servers yourself (faster iteration — avoids restarts between runs):

```bash
# Terminal 1: Server
cd server
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/aet_request_test \
TICKET_SYSTEM=debug \
AUTH_BYPASS=true \
CORS_ORIGINS='["http://localhost:5174"]' \
bash -c "uv run alembic upgrade head && uv run uvicorn request_server.main:app --host 0.0.0.0 --port 8009"

# Terminal 2: Client
cd client
VITE_API_BASE_URL=http://localhost:8009/api/v1 \
VITE_KEYCLOAK_URL=http://localhost:18080 \
VITE_KEYCLOAK_REALM=tum \
VITE_KEYCLOAK_CLIENT_ID=requestaccess \
npm run dev -- --port 5174

# Terminal 3: Tests (reuses running servers)
cd e2e
npm test
```

When servers are already running, Playwright detects them via `reuseExistingServer` and skips launching new ones.

## Test Architecture

### How It Works

The tests use a **DebugTicketService** instead of Jira/Redmine. When a form is submitted:

1. The client fills and submits the form in a real Chromium browser
2. The server processes the request and creates a ticket via `DebugTicketService`
3. `DebugTicketService` writes the ticket (summary, description, comments) as JSON to `/tmp/aet-debug-tickets/`
4. The test retrieves the ticket via `GET /api/v1/debug/tickets/latest` and asserts on its content

Authentication is bypassed (`AUTH_BYPASS=true`) — the server accepts any token. OIDC discovery and Keycloak endpoints are intercepted by Playwright route handlers that return mock responses.

### Key Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| `TICKET_SYSTEM=debug` | Server | Use DebugTicketService instead of Jira/Redmine |
| `AUTH_BYPASS=true` | Server | Accept fake JWT tokens without verification |
| `DATABASE_URL=...localhost:5433` | Server | Use the test database (not production) |
| Port 8009 | Server | Avoids conflict with default dev server (8000) |
| Port 5174 | Client | Avoids conflict with default dev server (5173) |

### Directory Structure

```
e2e/
├── fixtures/
│   ├── auth.ts          # Playwright fixtures: authenticatedPage, anonymousPage
│   └── test-data.ts     # Mock form data for all test configurations
├── helpers/
│   ├── debug-api.ts     # API helpers: getLatestTicket, resetTestState
│   └── form-fillers.ts  # Page Object helpers: fillVMRequestForm, fillArtemisForm, etc.
├── tests/
│   ├── vm-request.spec.ts              # 6 tests (iPraktikum, Thesis, Chair Project)
│   ├── vm-access-request.spec.ts       # 4 tests (new/existing SSH key combinations)
│   ├── artemis-authenticated.spec.ts   # 3 tests (single/multiple/other subteams)
│   ├── artemis-anonymous.spec.ts       # 3 tests (anonymous Artemis requests)
│   ├── tum-guest-authenticated.spec.ts # 4 tests (iPraktikum, Artemis, Other guest types)
│   └── tum-guest-anonymous-self.spec.ts# 3 tests (anonymous self-request)
├── docker-compose.yml   # Test PostgreSQL on port 5433
└── playwright.config.ts # Playwright config with webServer auto-start
```

### Test Fixtures

- **`authenticatedPage`** — A page with a pre-seeded OIDC session in `sessionStorage` and all Keycloak endpoints mocked. Forms see the user as logged in (`testuser / test@tum.de`).
- **`anonymousPage`** — A page with Keycloak endpoints mocked (to prevent hangs) but no session. Forms see the user as anonymous.

Both fixtures also mock the GitHub API (`api.github.com/users/*`) to avoid external network calls.

### Test Isolation

Each test calls `resetTestState()` in `beforeEach`, which:
- Deletes all captured debug tickets (`DELETE /api/v1/debug/tickets`)
- Truncates all request tables (`DELETE /api/v1/debug/db`)

## Test Coverage

| Form | Route | Tests | Auth Modes |
|------|-------|-------|------------|
| VM Request | `/request/vm` | 6 | Authenticated only |
| VM Access | `/request/vm-access` | 4 | Authenticated only |
| Artemis Developer | `/request/artemis` | 6 | Authenticated + Anonymous |
| TUM Guest Account | `/request/tum-guest` | 7 | Authenticated + Anonymous (self) |
| **Total** | | **23** | |

## Troubleshooting

### Tests hang on "Loading..."
The OIDC mock may not be intercepting correctly. Check that `VITE_KEYCLOAK_REALM` and `VITE_KEYCLOAK_CLIENT_ID` match the values in [fixtures/auth.ts](fixtures/auth.ts).

### "connect ECONNREFUSED" errors
The server crashed or wasn't started. Check `/tmp/e2e-server.log` or restart it manually (see above).

### Database table errors ("relation does not exist")
Migrations haven't run. The Playwright config runs `alembic upgrade head` automatically, but if you started the server manually, make sure to run migrations first.

### Viewing test reports
After a test run, open the HTML report:

```bash
npx playwright show-report
```

Failed tests include screenshots and (on retry) execution traces.
