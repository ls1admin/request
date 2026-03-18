import { test, expect } from "../fixtures/auth";
import { TUM_GUEST_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillTUMGuestForm } from "../helpers/form-fillers";

test.describe("TUM Guest Request - Anonymous (For Self)", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("iPraktikum customer, male, German", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.anon_self_ipraktikum_male_german);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Hans Weber");
    expect(ticket.summary).toContain("anonymous request");
    expect(ticket.description).toContain("TUM Guest Account Request");
    expect(ticket.description).toContain("requesting account for themselves");
    expect(ticket.description).toContain("Prof. Mueller");
    expect(ticket.description).toContain("Hans");
    expect(ticket.description).toContain("Weber");
    expect(ticket.description).toContain("hans.weber@example.de");
    expect(ticket.description).toContain("Male");
    expect(ticket.description).toContain("German");
    expect(ticket.description).toContain("iPraktikum Customer");
    expect(ticket.description).toContain("Team Epsilon");
    expect(ticket.description).toContain("Dr. Schwarz");
    expect(ticket.reporter_username).toBeNull();
    expect(ticket.comments.length).toBeGreaterThan(0);
  });

  test("Artemis, female, French", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.anon_self_artemis_female_french);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Marie Leclerc");
    expect(ticket.summary).toContain("anonymous request");
    expect(ticket.description).toContain("requesting account for themselves");
    expect(ticket.description).toContain("Dr. Dupont");
    expect(ticket.description).toContain("marie.l@example.fr");
    expect(ticket.description).toContain("Female");
    expect(ticket.description).toContain("French");
    expect(ticket.description).toContain("Artemis");
    expect(ticket.description).toContain("Sorbonne University");
    expect(ticket.reporter_username).toBeNull();
  });

  test("Other, diverse, other nationality (Japanese) with comment", async ({
    anonymousPage: page,
    request,
  }) => {
    await fillTUMGuestForm(page, TUM_GUEST_CONFIGS.anon_self_other_diverse_other_nat);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[TUM Guest]");
    expect(ticket.summary).toContain("Yuki Tanaka");
    expect(ticket.summary).toContain("anonymous request");
    expect(ticket.description).toContain("requesting account for themselves");
    expect(ticket.description).toContain("Prof. Tanaka");
    expect(ticket.description).toContain("yuki.t@example.jp");
    expect(ticket.description).toContain("Diverse");
    expect(ticket.description).toContain("Japanese");
    expect(ticket.description).toContain("Other");
    expect(ticket.description).toContain("quantum computing project");
    expect(ticket.description).toContain("Arriving in April");
    expect(ticket.reporter_username).toBeNull();
  });
});
