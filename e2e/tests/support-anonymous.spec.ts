import { test, expect } from "../fixtures/auth";
import { SUPPORT_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillSupportForm } from "../helpers/form-fillers";

test.describe("Support Request - Anonymous", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("feature request with TUM ID", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillSupportForm(page, SUPPORT_CONFIGS.anon_feature_request);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Support]");
    expect(ticket.summary).toContain("Support for GPU passthrough");
    expect(ticket.summary).toContain("External Researcher");
    expect(ticket.summary).toContain("anonymous");
    expect(ticket.description).toContain("Feature Request");
    expect(ticket.description).toContain("External Researcher");
    expect(ticket.description).toContain("researcher@partner-uni.edu");
    expect(ticket.description).toContain("ext42abc");
    expect(ticket.description).toContain("GPU passthrough");
    expect(ticket.reporter_username).toBeNull();
    expect(ticket.comments.length).toBe(0);
  });

  test("other category without TUM ID", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillSupportForm(page, SUPPORT_CONFIGS.anon_other_no_tumid);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Support]");
    expect(ticket.summary).toContain("General inquiry about services");
    expect(ticket.summary).toContain("Guest User");
    expect(ticket.description).toContain("Other");
    expect(ticket.description).toContain("Guest User");
    expect(ticket.description).toContain("guest@example.com");
    expect(ticket.description).not.toContain("TUM Identifier");
    expect(ticket.reporter_username).toBeNull();
  });
});
