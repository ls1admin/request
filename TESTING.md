# E2E Testing Guide

End-to-end tests use [Playwright](https://playwright.dev/) with a debug ticket system for verification.

## Quick Start

```bash
cd e2e
npx playwright install          # first time only
npx playwright test             # headless
npx playwright test --headed    # watch in browser
npx playwright test --ui        # interactive UI mode
npx playwright test --debug     # step-through debugger
```

Tests auto-start client (port 5715) and server (port 8001). Requires PostgreSQL on port 5433.

## Playwright MCP Server

A Playwright MCP server is available for interactive browser testing and debugging. Use it to navigate pages, take screenshots, inspect elements, and run browser code directly when developing or debugging tests.

## Project Structure

```text
e2e/
├── playwright.config.ts      # Config (ports, projects, timeouts)
├── tests/                    # Test spec files
├── fixtures/
│   ├── auth.ts               # authenticatedPage / anonymousPage fixtures
│   └── test-data.ts          # Pre-configured test scenarios
└── helpers/
    ├── form-fillers.ts       # Form navigation and filling helpers
    └── debug-api.ts          # Debug ticket API client
```

## Test Architecture

### Authentication Fixtures

Import from `fixtures/auth.ts` instead of Playwright's default:

```typescript
import { test, expect } from "../fixtures/auth";
```

Two page fixtures are available:

- **`authenticatedPage`** — Pre-seeded OIDC session (`testuser`, `test@tum.de`, `request-admin` role). Keycloak endpoints are mocked, GitHub API returns test profile.
- **`anonymousPage`** — OIDC endpoints mocked but no session. User goes through "Continue without sign in" flow.

### Debug Ticket System

The server runs with `TICKET_SYSTEM=debug`, writing tickets as JSON to `/tmp/aet-debug-tickets/`. The debug API helpers verify what the server produced:

```typescript
import { resetTestState, getLatestTicket } from "../helpers/debug-api";

// In beforeEach — always reset
await resetTestState(request);

// After form submission — verify
const ticket = await getLatestTicket(request);
expect(ticket.summary).toContain("[VM Request]");
expect(ticket.description).toContain("**Hostname:** my-vm");
```

**Available functions:**

| Function | Purpose |
| -------- | ------- |
| `resetTestState(request)` | Clear tickets and database (use in `beforeEach`) |
| `getLatestTicket(request)` | Get most recently created ticket |
| `getAllTickets(request)` | Get all tickets from this test run |
| `clearTickets(request)` | Clear tickets only |
| `clearDatabase(request)` | Clear database only |

**Ticket structure:**

```typescript
{
  ticket_key: string;
  summary: string;
  description: string;
  reporter_username: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  issue_type: string;
  comments: string[];
  custom_fields: Array<{ field: string; value: unknown }>;
}
```

### Form Filler Helpers

Reusable functions in `helpers/form-fillers.ts` handle multi-step form navigation:

| Helper | Description |
| ------ | ----------- |
| `navigateFromHome(page, cardTitle)` | Navigate from start page to a form |
| `clickNext(page)` | Click "Next" button in multi-step forms |
| `clickSubmit(page)` | Click "Submit Request" |
| `waitForSuccess(page)` | Wait for "Request Submitted!" message |
| `selectRadioCard(page, id)` | Click a radio card by its `for` attribute |
| `selectShadcnOption(page, triggerLabel, optionText)` | Select from shadcn dropdown |
| `fillDatePicker(page, dateStr)` | Fill date picker (format: `YYYY-MM-DD`) |
| `seedSSHKey(page)` | Pre-create an SSH key via API for "existing key" tests |

**Form-specific fillers:**

- `fillVMRequestForm(page, config)` — 6-step VM request
- `fillVMAccessForm(page, config)` — VM access request
- `fillArtemisForm(page, config)` — Artemis developer request
- `fillTUMGuestForm(page, config)` — TUM guest account request
- `fillSupportForm(page, config)` — Support request

### Test Data

Pre-configured scenarios in `fixtures/test-data.ts` cover each form type with multiple variations (auth status, optional fields, edge cases). Use these configs with the form fillers:

```typescript
import { vmRequestConfigs } from "../fixtures/test-data";

await fillVMRequestForm(page, vmRequestConfigs.ipraktikum_default);
```

## Writing a New Test

### 1. Add test data

Add a new config object to `fixtures/test-data.ts`:

```typescript
export const myFormConfigs = {
  basic_scenario: {
    isAuthenticated: true,
    fieldA: "value",
    fieldB: "value",
  },
};
```

### 2. Add a form filler (if new form)

Add a helper function to `helpers/form-fillers.ts`:

```typescript
export async function fillMyForm(page: Page, config: MyFormConfig) {
  await navigateFromHome(page, "My Form Card Title");

  // Fill fields
  await page.getByPlaceholder("Field A").fill(config.fieldA);
  await selectShadcnOption(page, "Field B", config.fieldB);

  // Multi-step: advance through steps
  await clickNext(page);
  // ... fill more steps ...

  await clickSubmit(page);
  await waitForSuccess(page);
}
```

### 3. Write the test spec

Create `tests/my-form.spec.ts`:

```typescript
import { test, expect } from "../fixtures/auth";
import { myFormConfigs } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillMyForm } from "../helpers/form-fillers";

test.describe("My Form", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("basic scenario", async ({ authenticatedPage: page, request }) => {
    await fillMyForm(page, myFormConfigs.basic_scenario);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("expected text");
    expect(ticket.description).toContain("Field A");
    expect(ticket.reporter_username).toBe("testuser");
  });

  test("anonymous scenario", async ({ anonymousPage: page, request }) => {
    await fillMyForm(page, myFormConfigs.anon_scenario);

    const ticket = await getLatestTicket(request);
    expect(ticket.reporter_username).toBeNull();
  });
});
```

## Best Practices

### Test Isolation

- **Always** call `resetTestState(request)` in `beforeEach` — never rely on state from another test.
- Tests run sequentially (`workers: 1`), but must be independent.

### Use Accessible Selectors

Prefer accessible queries that match what users see:

```typescript
// Good — accessible, resilient to DOM changes
page.getByRole("button", { name: "Next" });
page.getByPlaceholder("Enter hostname");
page.getByLabel("Enable Default Ports");
page.getByText("Request Submitted!");

// Acceptable — for specific targeting
page.locator('label[for="radio-card-id"]');

// Avoid — brittle, breaks on refactors
page.locator(".btn-primary");
page.locator("#submit-form > div:nth-child(3) > button");
```

### Use Existing Helpers

Always use the provided helpers instead of reimplementing interactions:

```typescript
// Good
await selectShadcnOption(page, "Protocol", "TCP");
await fillDatePicker(page, "2026-06-15");
await selectRadioCard(page, "thesis-ba");

// Bad — reimplements what helpers already do
await page.locator('[role="combobox"]').click();
await page.getByRole("option", { name: "TCP" }).click();
```

### Verify Through the Debug API

Assert on the ticket created by the server, not just UI state:

```typescript
// Good — verifies end-to-end
const ticket = await getLatestTicket(request);
expect(ticket.summary).toContain("[VM Request]");
expect(ticket.description).toContain("**Hostname:** my-vm");

// Incomplete — only verifies frontend
expect(page.getByText("Request Submitted!")).toBeVisible();
```

### Auth Verification Pattern

```typescript
// Authenticated
expect(ticket.reporter_username).toBe("testuser");
expect(ticket.comments.length).toBeGreaterThan(0);

// Anonymous
expect(ticket.reporter_username).toBeNull();
expect(ticket.comments.length).toBe(0);
```

### Seed Data When Needed

For tests that depend on existing data (e.g., selecting an existing SSH key):

```typescript
test("with existing SSH key", async ({ authenticatedPage: page, request }) => {
  await seedSSHKey(page);  // Create key via API before filling form
  await fillVMRequestForm(page, vmRequestConfigs.with_existing_key);
  // ...
});
```

## Anti-Patterns

### Sharing state between tests

```typescript
// Bad — tests depend on each other
let sharedTicketId: string;

test("create", async ({ authenticatedPage: page }) => {
  // ...
  sharedTicketId = ticket.ticket_key;
});

test("verify", async ({ request }) => {
  // Fails if "create" didn't run or failed
});
```

### Hardcoded waits instead of element waits

```typescript
// Bad — arbitrary sleep
await page.waitForTimeout(5000);
await page.click("#submit");

// Good — wait for the condition
await page.getByRole("button", { name: "Submit" }).waitFor({ state: "visible" });
await page.getByRole("button", { name: "Submit" }).click();
```

Note: Short `waitForTimeout(200-500)` calls after UI transitions (e.g., step navigation, dropdown animations) are acceptable when no better wait condition exists.

### Testing implementation details

```typescript
// Bad — tests internal state
expect(await page.evaluate(() => window.__formState.step)).toBe(3);

// Good — tests what the user sees
expect(page.getByText("Step 3 of 6")).toBeVisible();
```

### Duplicating form-filling logic

```typescript
// Bad — copy-pasting form filling steps across tests
test("scenario A", async ({ authenticatedPage: page }) => {
  await page.goto("/");
  await page.getByText("Request a New VM").click();
  await page.getByPlaceholder("my-vm-name").fill("test-vm");
  // ... 50 more lines of form filling
});

// Good — use the form filler helper
test("scenario A", async ({ authenticatedPage: page }) => {
  await fillVMRequestForm(page, vmRequestConfigs.scenario_a);
});
```

### Skipping ticket verification

```typescript
// Bad — only checks the frontend
await waitForSuccess(page);
// Test ends here

// Good — verify the backend actually processed it
await waitForSuccess(page);
const ticket = await getLatestTicket(request);
expect(ticket.summary).toContain("expected");
```

### CSS/XPath selectors for interactive elements

```typescript
// Bad
await page.locator("div.form-group > input.shadcn-input").fill("value");

// Good
await page.getByPlaceholder("Enter value").fill("value");
await page.getByLabel("Field name").fill("value");
```

## shadcn/ui Interaction Gotchas

- **Radio cards**: Click the `label[for="id"]`, not the hidden input — use `selectRadioCard()`.
- **Select/Combobox**: Click the trigger by accessible name, then the option — use `selectShadcnOption()`.
- **Checkboxes in admin views**: Some shadcn checkboxes need `.click()` instead of `.check()` / `.uncheck()`.
- **Date picker**: Has year/month dropdowns, not a native input — use `fillDatePicker()`.

## Configuration Reference

| Setting | Value |
| ------- | ----- |
| Test timeout | 60s |
| Expect timeout | 10s |
| Workers | 1 (sequential) |
| Server port | 8001 |
| Client port | 5715 |
| Test DB port | 5433 |
| Browser projects | Chromium (desktop), iPhone 14 Pro (mobile) |
| Screenshots | On failure only |
| Traces | On first retry |
