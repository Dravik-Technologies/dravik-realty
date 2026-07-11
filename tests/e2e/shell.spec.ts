import { test, expect } from "./fixtures";
import { LOCAL_COMMAND_SESSION } from "../../apps/command-center/src/auth/local-identity";
import {
  DASHBOARD_MODULES,
  NAV_SECTIONS,
  canAccessItem,
  filterDashboardModules,
  filterNavSections,
} from "../../apps/command-center/src/modules/registry";

// Dashboard tiles repeat the sidebar link names, so all shell assertions
// are scoped to the <aside> sidebar.
test.describe("shell chrome", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("global search opens and returns cross-module results", async ({ page }) => {
    await page.getByText("Search leads, partners, listings...").click();
    const input = page.getByRole("textbox").first();
    await expect(input).toBeVisible();
    await input.fill("Sarah");
    await expect(page.getByText(/Sarah/).first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("sidebar collapses and expands", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Lead Engine & Smart CRM")).toBeVisible();
    // Expanded state: the button's accessible name is its visible "Collapse"
    // label; collapsed state: icon-only, named by its "Expand sidebar" title.
    await sidebar.getByRole("button", { name: "Collapse", exact: true }).click();
    // Collapsed mode removes the label spans from the DOM (icon-only nav).
    await expect(sidebar.getByText("Lead Engine & Smart CRM")).toHaveCount(0);
    await sidebar.getByRole("button", { name: "Expand sidebar" }).click();
    await expect(sidebar.getByText("Lead Engine & Smart CRM")).toBeVisible();
  });

  test("sidebar navigates to the clicked route", async ({ page }) => {
    await page.locator("aside").getByRole("link", { name: "Transactions", exact: true }).click();
    await expect(page).toHaveURL(/\/transactions$/);
  });

  // E9.3: data-driven nav completeness. The shell now renders the subscribed
  // registry subset for the active session, not every module in the product.
  const VISIBLE_NAV_LABELS = [
    ...filterNavSections(LOCAL_COMMAND_SESSION).flatMap((section) =>
      section.items.map((item) => item.label)
    ),
    "Settings",
  ];
  const HIDDEN_NAV_LABELS = NAV_SECTIONS
    .flatMap((section) => section.items)
    .filter((item) => !canAccessItem(LOCAL_COMMAND_SESSION, item))
    .map((item) => item.label);

  test("sidebar renders subscribed nav items from the module registry", async ({ page }) => {
    const sidebar = page.locator("aside");
    for (const label of VISIBLE_NAV_LABELS) {
      await expect(sidebar.getByText(label)).toBeVisible();
    }

    for (const label of HIDDEN_NAV_LABELS) {
      await expect(sidebar.getByText(label)).toHaveCount(0);
    }
  });

  // Dashboard module tiles -- derived from DASHBOARD_MODULES in modules/registry.ts.
  const DASHBOARD_MODULE_HREFS = filterDashboardModules(LOCAL_COMMAND_SESSION).map((tile) => tile.href);
  const HIDDEN_DASHBOARD_MODULE_HREFS = DASHBOARD_MODULES
    .filter((tile) => !canAccessItem(LOCAL_COMMAND_SESSION, tile))
    .map((tile) => tile.href);

  test("dashboard renders subscribed module tiles from the registry", async ({ page }) => {
    for (const href of DASHBOARD_MODULE_HREFS) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    for (const href of HIDDEN_DASHBOARD_MODULE_HREFS) {
      await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
    }
  });
});
