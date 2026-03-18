import { test, expect } from "../fixtures/auth";
import { VM_REQUEST_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillVMRequestForm, seedSSHKey } from "../helpers/form-fillers";

test.describe("VM Request Form", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("iPraktikum - default resources, new SSH key", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillVMRequestForm(page, VM_REQUEST_CONFIGS.ipraktikum_default);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Request]");
    expect(ticket.summary).toContain("e2e-iprak-vm");
    expect(ticket.summary).toContain("testuser");
    expect(ticket.description).toContain("**Hostname:** e2e-iprak-vm");
    expect(ticket.description).toContain("iPraktikum");
    expect(ticket.description).toContain("**Team Name:** Team Alpha");
    expect(ticket.description).toContain("**Coach Name:** Prof. Smith");
    expect(ticket.description).toContain("**CPU Cores:** 4");
    expect(ticket.description).toContain("**RAM:** 4 GB");
    expect(ticket.reporter_username).toBe("testuser");
    expect(ticket.comments.length).toBeGreaterThan(0);
    expect(ticket.comments[0]).toContain("e2e-iprak-vm");
  });

  test("iPraktikum - high resources, existing SSH key", async ({
    authenticatedPage: page,
    request,
  }) => {
    await seedSSHKey(page);
    await fillVMRequestForm(page, VM_REQUEST_CONFIGS.ipraktikum_high_resources);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Request]");
    expect(ticket.summary).toContain("e2e-iprak-high");
    expect(ticket.description).toContain("**CPU Cores:** 8");
    expect(ticket.description).toContain("**RAM:** 16 GB");
    expect(ticket.description).toContain("Resource Justification");
    expect(ticket.description).toContain("Team Beta");
    expect(ticket.description).toContain("Dr. Johnson");
  });

  test("Thesis BA - default resources, additional port", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillVMRequestForm(page, VM_REQUEST_CONFIGS.thesis_ba_with_port);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Request]");
    expect(ticket.summary).toContain("e2e-thesis-ba");
    expect(ticket.description).toContain("Thesis");
    expect(ticket.description).toContain("BA");
    expect(ticket.description).toContain("Analysis of Distributed Systems");
    expect(ticket.description).toContain("Prof. Mueller");
    expect(ticket.description).toContain("8080");
    expect(ticket.description).toContain("Web application testing");
  });

  test("Thesis MA - high resources, ports, users, comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillVMRequestForm(page, VM_REQUEST_CONFIGS.thesis_ma_full);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Request]");
    expect(ticket.summary).toContain("e2e-thesis-ma");
    expect(ticket.description).toContain("MA");
    expect(ticket.description).toContain("Machine Learning Pipeline Optimization");
    expect(ticket.description).toContain("Dr. Weber");
    expect(ticket.description).toContain("**CPU Cores:** 16");
    expect(ticket.description).toContain("**RAM:** 32 GB");
    expect(ticket.description).toContain("8080");
    expect(ticket.description).toContain("5432");
    expect(ticket.description).toContain("collaborator1");
    expect(ticket.description).toContain("collaborator2");
  });

  test("Chair project - default resources, one user", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillVMRequestForm(page, VM_REQUEST_CONFIGS.chair_project_default);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Request]");
    expect(ticket.summary).toContain("e2e-chair-vm");
    expect(ticket.description).toContain("Chair Project");
    expect(ticket.description).toContain("Distributed Systems Lab");
    expect(ticket.description).toContain("Prof. Schmidt");
    expect(ticket.description).toContain("researcher1");
  });

  test("Chair project - high resources, existing SSH key, ports, users, comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await seedSSHKey(page);
    await fillVMRequestForm(page, VM_REQUEST_CONFIGS.chair_project_full);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Request]");
    expect(ticket.summary).toContain("e2e-chair-full");
    expect(ticket.description).toContain("Chair Project");
    expect(ticket.description).toContain("Research Prototype");
    expect(ticket.description).toContain("Prof. Bauer");
    expect(ticket.description).toContain("**CPU Cores:** 8");
    expect(ticket.description).toContain("3000");
    expect(ticket.description).toContain("dev1");
    expect(ticket.description).toContain("dev2");
    expect(ticket.description).toContain("dev3");
  });
});
