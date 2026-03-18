import { test, expect } from "../fixtures/auth";
import { VM_ACCESS_CONFIGS } from "../fixtures/test-data";
import { resetTestState, getLatestTicket } from "../helpers/debug-api";
import { fillVMAccessForm, seedSSHKey } from "../helpers/form-fillers";

test.describe("VM Access Request Form", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("new SSH key, no contact person", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillVMAccessForm(page, VM_ACCESS_CONFIGS.new_key_no_contact);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Access]");
    expect(ticket.summary).toContain("e2e-target-vm1");
    expect(ticket.summary).toContain("testuser");
    expect(ticket.description).toContain("**Hostname:** e2e-target-vm1");
    expect(ticket.description).toContain("collaborate on the distributed systems project");
    expect(ticket.reporter_username).toBe("testuser");
    expect(ticket.comments.length).toBeGreaterThan(0);
    expect(ticket.comments[0]).toContain("e2e-target-vm1");
  });

  test("new SSH key, with contact person", async ({
    authenticatedPage: page,
    request,
  }) => {
    await fillVMAccessForm(page, VM_ACCESS_CONFIGS.new_key_with_contact);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Access]");
    expect(ticket.summary).toContain("e2e-target-vm2");
    expect(ticket.description).toContain("**Contact Person:** Prof. Mueller");
    expect(ticket.description).toContain("Joining the development team");
  });

  test("existing SSH key, no contact, with comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await seedSSHKey(page);
    await fillVMAccessForm(page, VM_ACCESS_CONFIGS.existing_key_no_contact);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Access]");
    expect(ticket.summary).toContain("e2e-target-vm3");
    expect(ticket.description).toContain("ongoing maintenance and monitoring");
  });

  test("existing SSH key, with contact person, with comment", async ({
    authenticatedPage: page,
    request,
  }) => {
    await seedSSHKey(page);
    await fillVMAccessForm(page, VM_ACCESS_CONFIGS.existing_key_with_contact);

    const ticket = await getLatestTicket(request);
    expect(ticket.summary).toContain("[VM Access]");
    expect(ticket.summary).toContain("e2e-target-vm4");
    expect(ticket.description).toContain("**Contact Person:** Dr. Schmidt");
    expect(ticket.description).toContain("staging environment for integration testing");
  });
});
