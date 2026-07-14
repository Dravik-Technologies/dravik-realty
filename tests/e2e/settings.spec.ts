import { test, expect } from "./fixtures";

test.describe("settings", () => {
  test("section navigation switches panels", async ({ page }) => {
    await page.goto("/broker/settings");

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
    await page.goto("/broker/settings");

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

    const headerBrandLabel = page.locator("header").getByText("Titanium Realty", { exact: true }).first();
    await expect(headerBrandLabel).toHaveCSS("color", "rgba(253, 253, 253, 0.78)");
    await expect(page.locator("header .brand-logo-field")).toHaveCount(0);

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

    const shellSidebar = page.locator("aside").first();
    const shellLogo = shellSidebar.getByRole("img", { name: "Titanium Realty" }).first();
    await expect(shellLogo).toHaveCSS("object-fit", "cover");
    const shellLogoFrame = shellSidebar.locator(".brand-logo-frame").first();
    const shellLogoFrameBox = await shellLogoFrame.boundingBox();
    const shellLogoRadius = await shellLogoFrame.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)
    );
    expect(shellLogoRadius).toBeGreaterThanOrEqual((shellLogoFrameBox?.width ?? 0) / 2);

    await page.getByRole("button", { name: "Save Changes" }).click();
    await page.reload();

    await expect(page.locator("header")).toHaveCSS("background-color", "rgb(225, 29, 72)");
    await expect(page.locator("header")).toContainText("Titanium Realty");
    await expect(page.locator("body")).toHaveCSS("font-family", /Georgia/);
    await expect(page.locator("header .brand-logo-field")).toHaveCount(0);
    await expect(page.locator("aside").first().getByRole("img", { name: "Titanium Realty" })).toBeVisible();
  });

  test("appearance panel hydrates and saves tenant branding through the tenant API", async ({ page }) => {
    let savedBranding: Record<string, unknown> | null = null;
    const persistedBranding = {
      companyName: "Macsys Realty",
      companyInitials: "MR",
      accentColor: "#4F7CAC",
      headerColor: "#4F7CAC",
      headerTextColor: "#FDFDFD",
      sidebarColor: "#1C0B0B",
      fontId: "system",
      logoDataUrl: null,
    };

    await page.route("**/api/tenant/branding", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            branding: persistedBranding,
            persistence: "database",
          }),
        });
      }

      if (route.request().method() === "PUT") {
        savedBranding = (route.request().postDataJSON() as { branding?: Record<string, unknown> })
          .branding ?? null;

        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            branding: savedBranding,
            persistence: "database",
          }),
        });
      }

      return route.fallback();
    });

    await page.goto("/broker/settings");
    await expect(page.locator("header")).toContainText("Macsys Realty");

    await page.getByRole("button", { name: "Appearance", exact: true }).click();
    await expect(page.getByLabel("Company Name")).toHaveValue("Macsys Realty");
    await expect(page.getByLabel("Initials")).toHaveValue("MR");

    await page.getByLabel("Company Name").fill("Client Ready Realty");
    await page.getByLabel("Initials").fill("CR");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect
      .poll(() => savedBranding?.companyName)
      .toBe("Client Ready Realty");
    expect(savedBranding?.companyInitials).toBe("CR");
  });
});
