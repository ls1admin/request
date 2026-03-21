import { test, expect } from "../fixtures/auth";
import { resetTestState } from "../helpers/debug-api";

test.describe("External Links Admin", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("admin can create a section", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Test Section");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Verify section appears
    await expect(page.getByText("Test Section")).toBeVisible();
    await expect(page.getByText("(0 links)")).toBeVisible();
  });

  test("admin can create a link with all fields", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section first
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Links Section");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("Links Section")).toBeVisible();

    // Add a link with all fields
    await page.getByRole("button", { name: "Add Link" }).click();
    await page.getByPlaceholder("Label").fill("My Tool");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://example.com");
    await page.getByPlaceholder("Image URL (optional)").fill("https://example.com/logo.png");
    await page.getByPlaceholder("Description (optional)").fill("A great tool");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Verify the link appears
    await expect(page.getByText("My Tool")).toBeVisible();
    await expect(page.getByText("https://example.com")).toBeVisible();
    await expect(page.getByText("(1 link)")).toBeVisible();
  });

  test("admin can edit a link", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section and link
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Edit Test");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    await page.getByRole("button", { name: "Add Link" }).click();
    await page.getByPlaceholder("Label").fill("Original");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://original.com");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("Original", { exact: true })).toBeVisible();

    // Edit the link — the link item's pencil is the second one on the page (first is the section header's)
    await page.locator("button").filter({ has: page.locator("svg.lucide-pencil") }).nth(1).click();
    const labelInput = page.getByPlaceholder("Link label");
    await labelInput.fill("Updated");
    await page.getByRole("button", { name: "Save" }).click();

    // Verify updated
    await expect(page.getByText("Updated", { exact: true })).toBeVisible();
  });

  test("admin can toggle link enabled/disabled and it reflects on start page", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section and link
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Toggle Test");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    await page.getByRole("button", { name: "Add Link" }).click();
    await page.getByPlaceholder("Label").fill("Visible Link");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://visible.com");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Verify link appears on start page
    await page.goto("/");
    await expect(page.getByText("Visible Link")).toBeVisible();

    // Go back and disable the link
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });
    // Click the checkbox to disable (shadcn checkbox is a button, use click instead of uncheck)
    const checkbox = page.getByRole("checkbox", { name: "Enabled" });
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();

    // Verify link is hidden on start page
    await page.goto("/");
    await expect(page.getByText("Visible Link")).not.toBeVisible();
  });

  test("admin can delete a link", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section and link
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Delete Test");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    await page.getByRole("button", { name: "Add Link" }).click();
    await page.getByPlaceholder("Label").fill("To Delete");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://delete.com");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("To Delete")).toBeVisible();

    // Delete the link — the link item's trash is the second one on the page (first is the section header's)
    await page.locator("button").filter({ has: page.locator("svg.lucide-trash-2") }).nth(1).click();

    // Verify link is gone
    await expect(page.getByText("To Delete")).not.toBeVisible();
    await expect(page.getByText("(0 links)")).toBeVisible();
  });

  test("admin can delete a section", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Section To Delete");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("Section To Delete")).toBeVisible();

    // Delete the section
    await page.locator("button").filter({ has: page.locator("svg.lucide-trash-2") }).first().click();

    // Verify section is gone
    await expect(page.getByText("Section To Delete")).not.toBeVisible();
    await expect(page.getByText("No sections configured")).toBeVisible();
  });

  test("sections and links appear on the start page", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create first section with a link
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Dev Tools");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    await page.getByRole("button", { name: "Add Link" }).click();
    await page.getByPlaceholder("Label").fill("Public Tool");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://public.example.com");
    await page.getByPlaceholder("Description (optional)").fill("A public tool description");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Create second section with a link
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Documentation");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    await page.getByRole("button", { name: "Add Link" }).nth(1).click();
    await page.getByPlaceholder("Label").fill("Wiki");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://wiki.example.com");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Navigate to start page
    await page.goto("/");

    // Verify both sections and their links are visible
    await expect(page.getByText("Dev Tools")).toBeVisible();
    await expect(page.getByText("Public Tool", { exact: true })).toBeVisible();
    await expect(page.getByText("A public tool description")).toBeVisible();

    await expect(page.getByText("Documentation")).toBeVisible();
    await expect(page.getByText("Wiki", { exact: true })).toBeVisible();
  });

  test("disabled links are hidden on start page", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/admin/external-links");
    await page.getByText("Manage External Links").waitFor({ timeout: 10000 });

    // Create section with a link
    await page.getByRole("button", { name: "Add Section" }).click();
    await page.getByPlaceholder("e.g., Development Tools").fill("Hidden Section");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    await page.getByRole("button", { name: "Add Link" }).click();
    await page.getByPlaceholder("Label").fill("Hidden Link");
    await page.getByPlaceholder("URL", { exact: true }).fill("https://hidden.com");
    await page.getByRole("button", { name: "Add", exact: true }).click();

    // Click the checkbox to disable (shadcn checkbox is a button, use click instead of uncheck)
    const enabledCheckbox = page.getByRole("checkbox", { name: "Enabled" });
    await enabledCheckbox.click();
    await expect(enabledCheckbox).not.toBeChecked();

    // Navigate to start page — section should not appear (no enabled links)
    await page.goto("/");
    await expect(page.getByText("Hidden Link")).not.toBeVisible();
  });
});
