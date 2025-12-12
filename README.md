# AET Request

A web application for requesting university chair resources. Provides structured, validated forms for VM provisioning, VM access, Artemis developer accounts, and TUM guest accounts.

## Architecture

```
client/          React 19 + Vite + TypeScript + shadcn/ui
server/          FastAPI + SQLAlchemy + Alembic
deploy/
  client/        Dockerfile (nginx)
  server/        Dockerfile (uvicorn)
  helm/          Kubernetes Helm chart
```

## Getting Started

### Prerequisites

- Node.js 22+
- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- PostgreSQL 16+
- Docker (for deployment)

### Client

```bash
cd client
cp .env.example .env        # configure Keycloak + API URL
npm install
npm run dev                  # http://localhost:5173
```

### Server

```bash
cd server
cp .env.example .env         # configure database + Keycloak
uv sync
uv run alembic upgrade head  # run migrations
uv run uvicorn request_server.main:app --reload
```

### Database

```bash
cd server
docker compose up -d         # starts PostgreSQL on :5432
uv run alembic upgrade head
```

## Request Forms

| Form | Route | Auth Required | Description |
|------|-------|---------------|-------------|
| VM Request | `/request/vm` | Yes | Provision a new virtual machine |
| VM Access | `/request/vm-access` | Yes | Request access to an existing VM |
| Artemis Developer | `/request/artemis` | No | Artemis developer account setup |
| TUM Guest Account | `/request/tum-guest` | No | Guest account for external users |

## Deployment

The application ships as a Helm chart deploying client, server, and PostgreSQL to Kubernetes.

### Quick Deploy

```bash
cd deploy/helm/aet-request
helm dependency update
helm upgrade --install aet-request . \
  --namespace aet-request --create-namespace \
  -f /path/to/values-env.yaml
```

### Environment Overrides

The default `values.yaml` contains safe, generic defaults. Environment-specific configuration (hostnames, TLS, secrets) should be provided via a separate values file. See [`values-itg.example.yaml`](deploy/helm/values-itg.example.yaml) for a template.

### Features

- cert-manager TLS via `letsencrypt-production` ClusterIssuer
- Database migrations as a Helm pre-install/pre-upgrade Job
- ConfigMap checksum annotations for automatic pod restarts on config changes
- Startup/liveness/readiness probes
- Pod Disruption Budgets and optional HPA
- Network policies for ingress/egress restriction

### Docker Images

Images are built and pushed to GHCR via GitHub Actions:

```
ghcr.io/<owner>/request-client:<version>
ghcr.io/<owner>/request-server:<version>
```

## Development

```bash
# Client lint + format
cd client && npm run lint

# Server lint + format
cd server && uv run ruff check . && uv run ruff format .

# Type checking
cd client && npm run typecheck
cd server && uv run ty check .
```

## License

[MIT](LICENSE)
