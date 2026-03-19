import { defineConfig, devices } from "@playwright/test";

const SERVER_PORT = 8001;
const CLIENT_PORT = 5715;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const CLIENT_URL = `http://localhost:${CLIENT_PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: CLIENT_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `cd ../server && DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/aet_request_test TICKET_SYSTEM=debug AUTH_BYPASS=true CORS_ORIGINS='["${CLIENT_URL}"]' bash -c "uv run alembic upgrade head && uv run uvicorn request_server.main:app --host 0.0.0.0 --port ${SERVER_PORT}"`,
      port: SERVER_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        DATABASE_URL:
          "postgresql+asyncpg://postgres:postgres@localhost:5433/aet_request_test",
        TICKET_SYSTEM: "debug",
        AUTH_BYPASS: "true",
        CORS_ORIGINS: `["${CLIENT_URL}"]`,
      },
    },
    {
      command: `cd ../client && VITE_API_BASE_URL=${SERVER_URL}/api/v1 VITE_KEYCLOAK_URL=http://localhost:18080 VITE_KEYCLOAK_REALM=tum VITE_KEYCLOAK_CLIENT_ID=requestaccess npm run dev -- --port ${CLIENT_PORT}`,
      port: CLIENT_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});

export { SERVER_URL, CLIENT_URL };
