import {
  CLIENT_SESSION_COOKIE,
  COMMAND_SESSION_COOKIE,
  LOCAL_CLIENT_SESSION_VALUE,
  LOCAL_COMMAND_SESSION_VALUE,
  test,
  expect,
} from "./fixtures";

test.describe("identity boundaries", () => {
  test("command-center routes require internal sign in", async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Dravik Realty" })).toBeVisible();

    await page.getByRole("button", { name: "Continue as Chris Macabugao" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /, Chris\./ })).toBeVisible();
  });

  test("client portal requires a separate client sign in", async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal\/login$/);
    await expect(page.getByRole("heading", { name: "Client Portal" })).toBeVisible();

    await page.getByRole("button", { name: /John Smith/ }).click();
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.getByText("Active Transactions", { exact: true })).toBeVisible();
  });

  test("internal and client sessions are not interchangeable", async ({ context, page }) => {
    await context.clearCookies();
    await context.addCookies([
      {
        name: CLIENT_SESSION_COOKIE,
        value: LOCAL_CLIENT_SESSION_VALUE,
        url: "http://localhost:3000",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);

    await context.clearCookies();
    await context.addCookies([
      {
        name: COMMAND_SESSION_COOKIE,
        value: LOCAL_COMMAND_SESSION_VALUE,
        url: "http://localhost:3000",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal\/login$/);
  });

  test("entra routes fall back to existing login screens when not configured", async ({ context, page }) => {
    await context.clearCookies();

    await page.goto("/auth/command/sign-in");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Dravik Realty" })).toBeVisible();

    await page.goto("/auth/portal/sign-in");
    await expect(page).toHaveURL(/\/portal\/login$/);
    await expect(page.getByRole("heading", { name: "Client Portal" })).toBeVisible();
  });
});
