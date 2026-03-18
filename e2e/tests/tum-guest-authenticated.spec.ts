import { test, expect } from "../fixtures/auth";
import { TUM_GUEST_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillTUMGuestForm } from "../helpers/form-fillers";

test.describe("TUM Guest Request - Authenticated", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("iPraktikum customer, female, German", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.auth_ipraktikum_female_german);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Anna Schmidt");
    expect(ticket.summary).toContain("requested by testuser");
    expect(ticket.description).toContain("TUM Guest Account Request");
    expect(ticket.description).toContain("Anna");
    expect(ticket.description).toContain("Schmidt");
    expect(ticket.description).toContain("anna.schmidt@example.com");
    expect(ticket.description).toContain("Female");
    expect(ticket.description).toContain("German");
    expect(ticket.description).toContain("iPraktikum Customer");
    expect(ticket.description).toContain("Team Gamma");
    expect(ticket.description).toContain("Dr. Winter");
    expect(ticket.reporter_username).toBe("testuser");
    expect(ticket.comments.length).toBeGreaterThan(0);
    expect(ticket.comments[0]).toContain("Anna Schmidt");
  });

  test("Artemis, male, Swiss", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.auth_artemis_male_swiss);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Marco Bernasconi");
    expect(ticket.summary).toContain("requested by testuser");
    expect(ticket.description).toContain("marco.b@example.ch");
    expect(ticket.description).toContain("Male");
    expect(ticket.description).toContain("Swiss");
    expect(ticket.description).toContain("Artemis");
    expect(ticket.description).toContain("ETH Zurich");
    expect(ticket.reporter_username).toBe("testuser");
  });

  test("Other, diverse, other nationality (Brazilian) with comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.auth_other_diverse_other_nat);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Alex Silva");
    expect(ticket.summary).toContain("requested by testuser");
    expect(ticket.description).toContain("Diverse");
    expect(ticket.description).toContain("Brazilian");
    expect(ticket.description).toContain("Other");
    expect(ticket.description).toContain("Visiting researcher collaborating on the distributed systems project");
    expect(ticket.description).toContain("Will need access to the lab building as well");
  });

  test("iPraktikum customer, male, other nationality (Korean) with comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.auth_ipraktikum_male_other_nat);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Jun Park");
    expect(ticket.summary).toContain("requested by testuser");
    expect(ticket.description).toContain("jun.park@example.kr");
    expect(ticket.description).toContain("Male");
    expect(ticket.description).toContain("Korean");
    expect(ticket.description).toContain("iPraktikum Customer");
    expect(ticket.description).toContain("Team Delta");
    expect(ticket.description).toContain("Prof. Lee");
    expect(ticket.description).toContain("Exchange student from KAIST");
  });
});
