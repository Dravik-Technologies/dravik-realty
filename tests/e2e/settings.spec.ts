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

    await page.getByRole("button", { name: "Rose & Charcoal" }).click();
    await expect(page.locator("header")).toHaveCSS("background-color", "rgb(225, 29, 72)");

    const companyName = page.getByLabel("Company Name");
    await companyName.focus();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await expect(companyName).toHaveValue("");
    await companyName.pressSequentially("Titanium Realty");

    const initials = page.getByLabel("Initials");
    await initials.focus();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await expect(initials).toHaveValue("");
    await initials.pressSequentially("TR");

    await page.getByRole("button", { name: "Editorial Serif" }).click();

    await page.getByLabel("Tenant logo upload").setInputFiles({
      name: "tenant-logo.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lzY9WQAAAABJRU5ErkJggg==",
        "base64"
      ),
    });

    const logoPreview = page.getByLabel("Logo preview").getByRole("img", { name: "Titanium Realty" });
    await expect(logoPreview).toBeVisible();
    const logoBox = await logoPreview.boundingBox();
    expect(logoBox?.width).toBeGreaterThan(100);

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.reload();

    await expect(page.locator("header")).toHaveCSS("background-color", "rgb(225, 29, 72)");
    await expect(page.locator("header")).toContainText("Titanium Realty");
    await expect(page.locator("body")).toHaveCSS("font-family", /Georgia/);
    await expect(page.locator("header").getByRole("img", { name: "Titanium Realty" })).toBeVisible();
  });
});
