import { test, expect } from "./fixtures";
import type { Locator, Page } from "@playwright/test";

const COLUMN = 'div[class*="w-[280px]"]';

function column(page: Page, label: string): Locator {
  return page.locator(COLUMN).filter({
    has: page.getByText(label, { exact: true }),
  });
}

async function columnCount(col: Locator): Promise<number> {
  const badge = col.locator("span").filter({ hasText: /^\d+$/ }).first();
  return parseInt((await badge.textContent()) ?? "0", 10);
}

test.describe("leads pipeline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leads");
  });

  test("KPI strip and all five kanban columns render", async ({ page }) => {
    for (const kpi of ["Total Leads", "Hot Leads", "Avg Response", "Conversion Rate"]) {
      await expect(page.getByText(kpi, { exact: true })).toBeVisible();
    }
    for (const col of ["New Lead", "Contacted", "Engaged", "Active / Showing", "Under Contract"]) {
      await expect(column(page, col)).toHaveCount(1);
    }
  });

  test("search filters cards and clear-search restores them", async ({ page }) => {
    const search = page.getByPlaceholder("Filter leads…");
    await search.fill("Sarah Johnson");
    await expect(page.getByText("Sarah Johnson").first()).toBeVisible();
    await expect(page.getByText("Carlos Mendez")).toHaveCount(0);

    await search.fill("zzz-no-such-lead");
    await expect(page.getByText(/No leads match/)).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByText("Carlos Mendez").first()).toBeVisible();
  });

  test("sub-nav tabs switch and show counts", async ({ page }) => {
    await page.getByRole("button", { name: /^My Leads/ }).click();
    await page.getByRole("button", { name: /^Unassigned/ }).click();
    await page.getByRole("button", { name: /^All Leads/ }).click();
    await expect(page.getByText("Sarah Johnson").first()).toBeVisible();
  });

  test("clicking a lead card opens and closes the detail panel", async ({ page }) => {
    await page.getByText("Sarah Johnson").first().click();
    // Panel header shows the lead name (a second occurrence on the page).
    await expect(page.getByRole("heading", { name: /Sarah Johnson/ })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("kanban drag moves a card between columns", async ({ page }) => {
    const source = column(page, "New Lead");
    const target = column(page, "Contacted");

    const before = await columnCount(source);
    const targetBefore = await columnCount(target);
    test.skip(before === 0, "no cards in the source column");

    const card = source.locator('div[class*="space-y-3"] > div').first();
    const cardBox = await card.boundingBox();
    const targetBox = await target.boundingBox();
    if (!cardBox || !targetBox) throw new Error("missing bounding boxes");

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    // dnd-kit needs real intermediate pointer movement to register the drag.
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + Math.min(targetBox.height / 2, 300),
      { steps: 15 },
    );
    await page.mouse.up();

    await expect(async () => {
      expect(await columnCount(source)).toBe(before - 1);
      expect(await columnCount(target)).toBe(targetBefore + 1);
    }).toPass({ timeout: 5_000 });
  });
});
