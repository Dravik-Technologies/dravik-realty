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

test.describe("client portal admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/realty/client-portal");
  });

  test("realtor management surface renders client access controls", async ({ page }) => {
    await expect(page.getByRole("main").getByRole("heading", { name: "Client Portal Admin" })).toBeVisible();
    await expect(page.getByText("Client Access", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Preview Client Portal/ })).toHaveAttribute("href", "/portal");
  });
});
