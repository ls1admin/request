import { test, expect } from "../fixtures/auth";
import { SUPPORT_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillSupportForm } from "../helpers/form-fillers";

test.describe("Support Request - Authenticated", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("bug report", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillSupportForm(page, SUPPORT_CONFIGS.auth_bug);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Support]");
    expect(ticket.summary).toContain("VM not reachable via SSH");
    expect(ticket.summary).toContain("testuser");
    expect(ticket.description).toContain("Bug Report");
    expect(ticket.description).toContain("VM not reachable via SSH");
    expect(ticket.description).toContain("connection times out");
    expect(ticket.reporter_username).toBe("testuser");
    expect(ticket.comments.length).toBeGreaterThan(0);
    expect(ticket.comments[0]).toContain("support request has been received");
  });

  test("question", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillSupportForm(page, SUPPORT_CONFIGS.auth_question);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Support]");
    expect(ticket.summary).toContain("How to increase VM disk space");
    expect(ticket.description).toContain("Question");
    expect(ticket.description).toContain("disk space");
    expect(ticket.reporter_username).toBe("testuser");
  });
});
