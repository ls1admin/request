import { test, expect } from "../fixtures/auth";
import { TEST_SSH_KEY_NAME, TEST_SSH_PUBLIC_KEY } from "../fixtures/test-data";
import { resetTestState } from "../helpers/debug-api";

test.describe("Announcement and SSH Keys", () => {
  test.beforeEach(async ({ request }) => {
    await resetTestState(request);
  });

  test("what's new dialog appears once for authenticated users", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.removeItem("aet-request.whats-new.v1.dismissed");
    });
    await page.reload();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Request Access is now AET Request" }),
    ).toBeVisible();
    await expect(page.getByText("Coming soon")).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await page.reload();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("authenticated user can manage SSH keys from the account dropdown", async ({
    authenticatedPage: page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("aet-request.whats-new.v1.dismissed", "true");
    });
    await page.goto("/");

    await page.getByRole("button", { name: /Test User/ }).click();
    await page.getByRole("link", { name: "SSH Keys" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: "Stored SSH Keys" }),
    ).toBeVisible();

    await page.getByLabel("Key name").fill(TEST_SSH_KEY_NAME);
    await page.getByLabel("Public key").fill(TEST_SSH_PUBLIC_KEY);
    await page.getByRole("button", { name: "Add SSH Key" }).click();

    await expect(page.getByText("SSH key added.")).toBeVisible();
    await expect(page.getByText(TEST_SSH_KEY_NAME)).toBeVisible();
    await expect(page.getByText("SHA256:", { exact: false })).toBeVisible();
    await expect(page.getByText(TEST_SSH_PUBLIC_KEY, { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "Reveal" }).click();
    await expect(page.getByText(TEST_SSH_PUBLIC_KEY)).toBeVisible();

    page.once("dialog", (dialog) => {
      void dialog.accept();
    });
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("SSH key deleted.")).toBeVisible();
    await expect(page.getByText(TEST_SSH_KEY_NAME)).not.toBeVisible();
  });
});
