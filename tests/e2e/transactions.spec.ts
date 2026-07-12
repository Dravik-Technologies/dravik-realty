import { test, expect } from "./fixtures";

test.describe("transactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/realty/transactions");
  });

  test("pipeline renders with transaction cards", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Transactions", exact: true }).first()).toBeVisible();
    await expect(page.getByText("12 Ocean Dr").first()).toBeVisible();
  });

  test("selecting a transaction opens the detail panel with commission breakdown", async ({ page }) => {
    await page.getByText("12 Ocean Dr").first().click();
    await expect(page.getByText(/Commission/).first()).toBeVisible();
  });

  test("transaction document actions stage uploads, previews, and signature packets", async ({ page }) => {
    await page.getByText("28 Brickell Key Dr").first().click();
    await page.getByRole("button", { name: /Documents/ }).click();

    await page.getByRole("button", { name: "Upload" }).click();
    await expect(page.getByText("Client Upload Packet staged for this transaction.")).toBeVisible();
    await expect(page.getByText("Previewing Client Upload Packet")).toBeVisible();

    await page.getByRole("button", { name: "Send for Signature" }).click();
    await expect(page.getByText("Signature packet queued for 1 pending document.")).toBeVisible();

    await page.getByRole("button", { name: "Preview Closing Disclosure" }).click();
    await expect(page.getByText("Previewing Closing Disclosure")).toBeVisible();
  });
});
