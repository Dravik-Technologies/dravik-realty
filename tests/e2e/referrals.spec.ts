import { test, expect } from "./fixtures";

test.describe("global referral network", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/referral-network");
  });

  test("KPIs, agent directory, and pipeline render", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Global Referral Network" }).first()).toBeVisible();
    await expect(page.getByText("Active Referrals", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agent Directory" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Outbound Pipeline" })).toBeVisible();
  });

  test("initiating a referral opens the modal with the split calculator", async ({ page }) => {
    await page.getByRole("button", { name: "Initiate Referral" }).first().click();
    await expect(page.locator("#referral-modal-title")).toBeVisible();
    await expect(page.getByText(/Split/).first()).toBeVisible();
  });
});
