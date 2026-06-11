import { test, expect } from "./fixtures";

test.describe("client portal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portal");
  });

  test("dashboard cards render", async ({ page }) => {
    await expect(page.getByText("Active Transactions", { exact: true })).toBeVisible();
  });

  test("tabs switch between transactions and documents", async ({ page }) => {
    await page.getByRole("button", { name: /Documents/ }).first().click();
    await page.getByRole("button", { name: /Transactions/ }).first().click();
  });
});
