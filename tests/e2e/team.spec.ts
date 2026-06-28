import { test, expect } from "./fixtures";

// Directory tab buttons render as "<label> <count>", so accessible names
// are matched by prefix, never exactly.
test.describe("team management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/broker/team");
  });

  test("directory filter tabs and Add Agent affordance render", async ({ page }) => {
    for (const tab of ["All Agents", "My Team", "Dual Licensed", "New Agents"]) {
      await expect(page.getByRole("button", { name: new RegExp(`^${tab}`) })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /Add Agent/ })).toBeVisible();
  });

  test("filter tabs switch without errors", async ({ page }) => {
    await page.getByRole("button", { name: /^My Team/ }).click();
    await page.getByRole("button", { name: /^New Agents/ }).click();
    await page.getByRole("button", { name: /^All Agents/ }).click();
  });
});
