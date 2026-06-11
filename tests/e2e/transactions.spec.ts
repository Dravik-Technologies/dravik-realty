import { test, expect } from "./fixtures";

test.describe("transactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transactions");
  });

  test("pipeline renders with transaction cards", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Transactions", exact: true }).first()).toBeVisible();
    await expect(page.getByText("12 Ocean Dr").first()).toBeVisible();
  });

  test("selecting a transaction opens the detail panel with commission breakdown", async ({ page }) => {
    await page.getByText("12 Ocean Dr").first().click();
    await expect(page.getByText(/Commission/).first()).toBeVisible();
  });
});
