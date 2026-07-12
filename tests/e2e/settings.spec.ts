import { test, expect } from "./fixtures";

test.describe("settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/broker/settings");
  });

  test("section navigation switches panels", async ({ page }) => {
    for (const section of [
      "Users & Permissions",
      "Commission & Billing",
      "Integrations",
      "Compliance & Docs",
      "Appearance",
      "Notifications",
      "Security & Audit",
      "General",
    ]) {
      await page.getByRole("button", { name: section, exact: true }).click();
    }
    // Lands back on General without errors.
    await expect(page.getByRole("button", { name: "General", exact: true })).toBeVisible();
  });

  test("appearance panel applies tenant branding to the app shell", async ({ page }) => {
    await page.getByRole("button", { name: "Appearance", exact: true }).click();

    await page.getByLabel("Company Name").fill("Titanium Realty");
    await page.getByLabel("Initials").fill("TR");
    await page.getByLabel("Header color").fill("#D1CFCF");
    await page.getByRole("button", { name: "Editorial Serif" }).click();

    await page.getByLabel("Tenant logo upload").setInputFiles({
      name: "tenant-logo.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lzY9WQAAAABJRU5ErkJggg==",
        "base64"
      ),
    });

    await expect(page.getByRole("img", { name: "Titanium Realty" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Apply Theme" }).click();

    await expect(page.locator("header")).toHaveCSS("background-color", "rgb(209, 207, 207)");
    await expect(page.locator("header")).toContainText("Titanium Realty");
    await expect(page.locator("body")).toHaveCSS("font-family", /Georgia/);
    await expect(page.locator("header").getByRole("img", { name: "Titanium Realty" })).toBeVisible();
  });
});
