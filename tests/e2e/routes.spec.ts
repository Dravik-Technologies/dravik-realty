import { test, expect } from "./fixtures";

// Route smoke: every route renders its primary content with no console
// errors and no failed requests (asserted automatically by fixtures).

test("/ redirects to /dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /, Chris\./ })).toBeVisible();
});

const ROUTES: Array<{ path: string; probe: (page: import("@playwright/test").Page) => ReturnType<import("@playwright/test").Page["locator"]> }> = [
  { path: "/dashboard", probe: (p) => p.getByRole("heading", { name: /, Chris\./ }) },
  { path: "/crm/leads", probe: (p) => p.getByText("Total Leads", { exact: true }) },
  { path: "/crm/prospecting", probe: (p) => p.getByRole("heading", { name: "Prospecting & Seller Leads Center" }).first() },
  { path: "/referrals", probe: (p) => p.getByRole("heading", { name: "DRAVIK Partner Network" }).first() },
  { path: "/realty/mapping", probe: (p) => p.getByRole("button", { name: "List" }) },
  { path: "/realty/listings", probe: (p) => p.getByRole("heading", { name: "Listings" }).first() },
  { path: "/marketing", probe: (p) => p.getByRole("heading", { name: "Marketing", exact: true }).first() },
  { path: "/realty/transactions", probe: (p) => p.getByRole("heading", { name: "Transactions", exact: true }).first() },
  { path: "/crm/inbox", probe: (p) => p.getByRole("navigation", { name: "Inbox folders" }) },
  { path: "/realty/client-portal", probe: (p) => p.getByRole("heading", { name: "Client Portal Admin" }).first() },
  { path: "/portal", probe: (p) => p.getByText("Active Transactions", { exact: true }) },
  { path: "/broker/reports", probe: (p) => p.getByRole("heading", { name: "Reports & Analytics" }).first() },
  { path: "/broker/team", probe: (p) => p.getByRole("button", { name: "My Team" }) },
  { path: "/lending", probe: (p) => p.getByRole("heading", { name: "Mortgage Tools" }).first() },
  { path: "/broker/settings", probe: (p) => p.getByText("Users & Permissions").first() },
];

for (const { path, probe } of ROUTES) {
  test(`${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(probe(page)).toBeVisible();
  });
}

const REDIRECTS: Array<{ from: string; to: string }> = [
  { from: "/leads", to: "/crm/leads" },
  { from: "/inbox", to: "/crm/inbox" },
  { from: "/prospecting", to: "/crm/prospecting" },
  { from: "/mapping", to: "/realty/mapping" },
  { from: "/transactions", to: "/realty/transactions" },
  { from: "/mortgage", to: "/lending" },
  { from: "/referral-network", to: "/referrals" },
  { from: "/team", to: "/broker/team" },
  { from: "/reports", to: "/broker/reports" },
  { from: "/settings", to: "/broker/settings" },
];

for (const { from, to } of REDIRECTS) {
  test(`${from} permanently redirects to ${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(to.replace("/", "\\/") + "$"));
  });
}

test("unknown module slug shows the Coming Soon placeholder", async ({ page }) => {
  await page.goto("/ai-concierge");
  await expect(page.getByRole("heading", { name: "Ai Concierge" })).toBeVisible();
  await expect(page.getByText("Coming Soon")).toBeVisible();
});
