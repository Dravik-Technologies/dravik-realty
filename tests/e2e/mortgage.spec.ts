import { test, expect } from "./fixtures";

test.describe("mortgage tools", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mortgage");
  });

  test("pipeline stages render", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Mortgage Tools" }).first()).toBeVisible();
    for (const stage of ["Pre-Qual Submitted", "Underwriting"]) {
      await expect(page.getByText(stage, { exact: true }).first()).toBeVisible();
    }
  });

  test("pre-qual calculator input changes the computed result", async ({ page }) => {
    // The calculator lives behind the "Calculators" section toggle.
    await page.getByRole("button", { name: /Calculators/ }).click();
    await expect(page.getByText("Annual Household Income")).toBeVisible();
    // Two calculators render a "Max Loan" chip; the pre-qual one is first.
    await expect(page.getByText("Max Loan", { exact: true }).first()).toBeVisible();

    // The result chip's value sits next to the "Max Loan" label.
    const resultArea = page.getByText("Max Loan", { exact: true }).first().locator("..");
    const before = await resultArea.textContent();

    const incomeSlider = page
      .locator("div")
      .filter({ has: page.getByText("Annual Household Income") })
      .locator('input[type="range"]')
      .first();
    await incomeSlider.focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");

    await expect(async () => {
      expect(await resultArea.textContent()).not.toBe(before);
    }).toPass({ timeout: 3_000 });
  });
});
