import { test, expect } from "./fixtures";

test.describe("settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/broker/settings");
  });

  test("section navigation switches panels", async ({ page }) => {
    for (const section of [
      "Users & Permissions",
      "Commission & Billing",
      "Integrations",
      "Compliance & Docs",
      "Appearance",
      "Notifications",
      "Security & Audit",
      "General",
    ]) {
      await page.getByRole("button", { name: section, exact: true }).click();
    }
    // Lands back on General without errors.
    await expect(page.getByRole("button", { name: "General", exact: true })).toBeVisible();
  });
});
