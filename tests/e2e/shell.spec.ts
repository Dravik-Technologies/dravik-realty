import { test, expect } from "./fixtures";

// Dashboard tiles repeat the sidebar link names, so all shell assertions
// are scoped to the <aside> sidebar.
test.describe("shell chrome", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("global search opens and returns cross-module results", async ({ page }) => {
    await page.getByText("Search leads, agents, properties...").click();
    const input = page.getByRole("textbox").first();
    await expect(input).toBeVisible();
    await input.fill("Sarah");
    await expect(page.getByText(/Sarah/).first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("sidebar collapses and expands", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Lead Engine & Smart CRM")).toBeVisible();
    // Expanded state: the button's accessible name is its visible "Collapse"
    // label; collapsed state: icon-only, named by its "Expand sidebar" title.
    await sidebar.getByRole("button", { name: "Collapse", exact: true }).click();
    // Collapsed mode removes the label spans from the DOM (icon-only nav).
    await expect(sidebar.getByText("Lead Engine & Smart CRM")).toHaveCount(0);
    await sidebar.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(sidebar.getByText("Lead Engine & Smart CRM")).toBeVisible();
  });

  test("sidebar navigates to the clicked route", async ({ page }) => {
    await page.locator("aside").getByRole("link", { name: "Transactions", exact: true }).click();
    await expect(page).toHaveURL(/\/transactions$/);
  });
});
