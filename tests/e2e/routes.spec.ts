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
  { path: "/leads", probe: (p) => p.getByText("Total Leads", { exact: true }) },
  { path: "/prospecting", probe: (p) => p.getByRole("heading", { name: "Prospecting & Seller Leads Center" }).first() },
  { path: "/referral-network", probe: (p) => p.getByRole("heading", { name: "Global Referral Network" }).first() },
  { path: "/mapping", probe: (p) => p.getByRole("button", { name: "List" }) },
  { path: "/marketing", probe: (p) => p.getByRole("heading", { name: "Marketing", exact: true }).first() },
  { path: "/transactions", probe: (p) => p.getByRole("heading", { name: "Transactions", exact: true }).first() },
  { path: "/inbox", probe: (p) => p.getByRole("heading", { name: "Unified Inbox" }).first() },
  { path: "/portal", probe: (p) => p.getByText("Active Transactions", { exact: true }) },
  { path: "/reports", probe: (p) => p.getByRole("heading", { name: "Reports & Analytics" }).first() },
  { path: "/team", probe: (p) => p.getByRole("button", { name: "My Team" }) },
  { path: "/mortgage", probe: (p) => p.getByRole("heading", { name: "Mortgage Tools" }).first() },
  { path: "/settings", probe: (p) => p.getByText("Users & Permissions").first() },
];

for (const { path, probe } of ROUTES) {
  test(`${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(probe(page)).toBeVisible();
  });
}

test("unknown module slug shows the Coming Soon placeholder", async ({ page }) => {
  await page.goto("/ai-concierge");
  await expect(page.getByRole("heading", { name: "Ai Concierge" })).toBeVisible();
  await expect(page.getByText("Coming Soon")).toBeVisible();
});
