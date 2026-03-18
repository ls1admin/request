import { test, expect } from "../fixtures/auth";
import { ARTEMIS_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillArtemisForm } from "../helpers/form-fillers";

test.describe("Artemis Developer Request - Authenticated", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("single subteam (ares)", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillArtemisForm(page, ARTEMIS_CONFIGS.auth_single_subteam);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Artemis Dev]");
    expect(ticket.summary).toContain("e2e-dev-user");
    expect(ticket.summary).toContain("testuser");
    expect(ticket.description).toContain("Artemis Developer Access Request");
    expect(ticket.description).toContain("e2e-dev-user");
    expect(ticket.description).toContain("e2e-dev@slack.example.com");
    expect(ticket.description).toContain("Prof. Schmidt");
    expect(ticket.description).toContain("Dr. Weber");
    expect(ticket.description).toContain("Ares");
    expect(ticket.description).toContain("CSV Import Line");
    expect(ticket.reporter_username).toBe("testuser");
    expect(ticket.comments.length).toBeGreaterThan(0);
  });

  test("multiple subteams", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillArtemisForm(page, ARTEMIS_CONFIGS.auth_multiple_subteams);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Artemis Dev]");
    expect(ticket.summary).toContain("e2e-multi-dev");
    expect(ticket.description).toContain("Ares");
    expect(ticket.description).toContain("Iris");
    expect(ticket.description).toContain("Programming");
    expect(ticket.description).toContain("CSV Import Line");
  });

  test("subteams with 'other' and comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillArtemisForm(page, ARTEMIS_CONFIGS.auth_with_other);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Artemis Dev]");
    expect(ticket.summary).toContain("e2e-other-dev");
    expect(ticket.description).toContain("Custom Research Team");
    expect(ticket.description).toContain("Prof. Fischer");
    expect(ticket.description).toContain("Dr. Lang");
  });
});
