import { test, expect } from "./fixtures";

test.describe("DRAVIK Partner Network", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/referrals");
  });

  test("KPIs, agent directory, and pipeline render", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "DRAVIK Partner Network" }).first()).toBeVisible();
    await expect(page.getByText("Active Referrals", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Partner Directory" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Global Referral Pipeline" })).toBeVisible();
  });

  test("initiating a referral opens the modal with the split calculator", async ({ page }) => {
    await page.getByRole("button", { name: "Start Referral" }).first().click();
    await expect(page.locator("#referral-modal-title")).toBeVisible();
    await expect(page.getByText(/Split/).first()).toBeVisible();
  });
});
