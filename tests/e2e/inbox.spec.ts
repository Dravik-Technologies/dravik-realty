import { test, expect } from "./fixtures";

// Inbox timestamps are static fixture strings ("10:32 AM"), not computed
// relative times — assert the clock pattern, not exact values, so fixture
// edits don't break the suite.
const CLOCK_TIME = /\d{1,2}:\d{2} [AP]M/;

test.describe("unified inbox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/crm/inbox");
  });

  test("conversation list renders with timestamps", async ({ page }) => {
    await expect(page.getByPlaceholder("Search conversations…")).toBeVisible();
    await expect(page.getByText("John Smith").first()).toBeVisible();
    await expect(page.getByText(CLOCK_TIME).first()).toBeVisible();
  });

  test("selecting a conversation loads the thread and composer accepts text", async ({ page }) => {
    await page.getByText("John Smith").first().click();

    const composer = page.getByPlaceholder(/Compose an email…|Type a text message…/);
    await expect(composer).toBeVisible();
    await composer.fill("Characterization probe — not sent");
    await expect(composer).toHaveValue("Characterization probe — not sent");
  });
});
