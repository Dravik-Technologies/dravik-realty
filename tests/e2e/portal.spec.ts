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

  test("document vault upload and preview actions render local feedback", async ({ page }) => {
    await page.getByRole("button", { name: /Documents/ }).first().click();

    await page.getByRole("button", { name: "Preview Purchase Agreement" }).first().click();
    await expect(page.getByText("Previewing Purchase Agreement")).toBeVisible();

    await page.getByRole("button", { name: "Upload Title Commitment" }).click();
    await expect(page.getByText("Previewing Title Commitment")).toBeVisible();
  });

  test("saved property sharing gives the client visible confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "Saved" }).first().click();
    await page.getByRole("button", { name: "Share" }).first().click();

    await expect(page.getByText(/shared with your agent/)).toBeVisible();
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
