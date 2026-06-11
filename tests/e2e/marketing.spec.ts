import { test, expect } from "./fixtures";

test.describe("marketing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/marketing");
  });

  test("all four tabs switch without errors", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Marketing", exact: true })).toBeVisible();
    for (const tab of ["Landing Pages", "Flyers & Brochures", "Templates", "My Campaigns"]) {
      await page.getByRole("button", { name: tab, exact: true }).click();
    }
    // Back on campaigns; the create button strip is present.
    await expect(page.getByRole("button", { name: "My Campaigns", exact: true })).toBeVisible();
  });
});
