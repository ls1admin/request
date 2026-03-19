import { test, expect } from "../fixtures/auth";
import { ARTEMIS_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillArtemisForm } from "../helpers/form-fillers";

test.describe("Artemis Developer Request - Anonymous", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("anonymous - single subteam", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillArtemisForm(page, ARTEMIS_CONFIGS.anon_single_subteam);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Artemis Dev]");
    expect(ticket.summary).toContain("e2e-ext-dev");
    expect(ticket.summary).toContain("anonymous");
    expect(ticket.summary).toContain("External Developer");
    expect(ticket.description).toContain("Artemis Developer Access Request");
    expect(ticket.description).toContain("External Developer");
    expect(ticket.description).toContain("external.dev@company.com");
    expect(ticket.description).toContain("e2e-ext-dev");
    expect(ticket.description).toContain("Apollon");
    expect(ticket.description).toContain("CSV Import Line");
    expect(ticket.reporter_username).toBeNull();
    expect(ticket.comments.length).toBe(0);
  });

  test("anonymous - multiple subteams with comment", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillArtemisForm(page, ARTEMIS_CONFIGS.anon_multiple_subteams);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Artemis Dev]");
    expect(ticket.summary).toContain("e2e-guest-dev");
    expect(ticket.summary).toContain("Guest Contributor");
    expect(ticket.description).toContain("Hephaestus");
    expect(ticket.description).toContain("Operations");
    expect(ticket.description).toContain("guest@university.edu");
  });

  test("anonymous - subteams with 'other'", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillArtemisForm(page, ARTEMIS_CONFIGS.anon_with_other);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[Artemis Dev]");
    expect(ticket.summary).toContain("e2e-research-dev");
    expect(ticket.summary).toContain("Research Partner");
    expect(ticket.description).toContain("Research Collaboration");
    expect(ticket.description).toContain("Prof. Hartmann");
  });
});
