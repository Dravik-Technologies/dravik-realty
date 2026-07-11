import { test, expect } from "./fixtures";

test.describe("listings workspace", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/realty/listings");
  });

  test("adds a listing and shares it to the Partner Network", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Listings" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Add Listing" }).first().click();
    await page.getByLabel("Address").fill("742 Coral Way");
    await page.getByLabel("City").fill("Miami");
    await page.getByLabel("State").fill("FL");
    await page.getByRole("textbox", { name: "Price", exact: true }).fill("875000");
    await page.getByLabel("Beds").fill("3");
    await page.getByLabel("Baths").fill("2");
    await page.getByLabel("Square Feet").fill("1840");
    await page.getByRole("button", { name: "Save Listing" }).click();

    const card = page.locator("article").filter({ hasText: "742 Coral Way" }).first();
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Share" }).click();
    await expect(card.getByText("Partner Network")).toBeVisible();
    await card.getByRole("button", { name: "Go Active" }).click();
    await expect(card.getByText("Active").first()).toBeVisible();
  });
});
