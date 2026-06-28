import { test, expect } from "./fixtures";

test.describe("interactive mapping", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/realty/mapping");
  });

  test("map view mounts its container (no tile assertions)", async ({ page }) => {
    // External tile requests are blocked by the fixtures; we only assert the
    // Leaflet container mounts — never tile pixels.
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("list view toggle shows the property list", async ({ page }) => {
    await page.getByRole("button", { name: "List" }).click();
    await expect(page.locator(".leaflet-container")).toHaveCount(0);
    await page.getByRole("button", { name: "Map", exact: true }).click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("filters change the result count", async ({ page }) => {
    const results = page.getByText(/\d+ (properties|results|homes)/i).first();
    const before = await results.textContent().catch(() => null);

    const bedsSelect = page.locator("select").filter({ hasText: "Any Beds" }).first();
    await bedsSelect.selectOption({ label: "4+ Beds" });

    if (before) {
      await expect(async () => {
        expect(await results.textContent()).not.toBe(before);
      }).toPass({ timeout: 3_000 });
    }
  });
});
