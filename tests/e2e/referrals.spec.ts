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

  test("referral agreement CTA queues the agreement", async ({ page }) => {
    await page.getByRole("button", { name: "Start Referral" }).first().click();
    await page.getByRole("button", { name: "Send Referral Agreement" }).click();

    await expect(page.getByRole("button", { name: "Agreement Queued" })).toBeVisible();
    await expect(page.getByText(/Agreement queued for/)).toBeVisible();
  });

  test("partner directory includes mortgage lenders", async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByLabel("Partner type").selectOption("Mortgage Lender");

    await expect(page.getByText("4 of 22 partners")).toBeVisible();
    await expect(page.getByText("Nina Brooks")).toBeVisible();
    await expect(page.locator("span").filter({ hasText: /^Lender$/ }).first()).toBeVisible();
    await expect(page.locator("span").filter({ hasText: "Mortgage Lender" }).first()).toBeVisible();
  });

  test("map view uses global partner search without PCS hotspots", async ({ page }) => {
    await page.getByRole("button", { name: "Map View" }).click();
    await expect(page.getByRole("heading", { name: "Global Partner Search" })).toBeVisible();
    await expect(page.getByText("PCS Hotspots")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Quick actions" })).toBeVisible();

    const mapSearch = page.getByRole("combobox", { name: /search/i });
    await mapSearch.fill("zzzz-not-a-place");
    await expect(page.getByText("No partners within that area")).toBeVisible();

    await mapSearch.fill("Miami");
    await expect(page.getByRole("option", { name: /Miami/ }).first()).toBeVisible();

    await page.getByRole("button", { name: "Lenders" }).click();
    await expect(page.getByText("Nina Brooks")).toBeVisible();
  });
});
