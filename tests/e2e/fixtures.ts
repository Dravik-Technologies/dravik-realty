import { test as base, expect } from "@playwright/test";

/**
 * Characterization fixtures (Phase 1, E2).
 *
 * Every test automatically:
 *  - blocks requests to hosts other than localhost (Leaflet tile fetches etc.),
 *    keeping runs deterministic and offline-safe;
 *  - fails if the page logs a console error or throws an uncaught exception;
 *  - fails if any same-origin request fails or returns HTTP >= 400.
 *
 * Relative timestamps ("3d ago") drift with the clock — specs must match
 * RELATIVE_TIME, never exact strings.
 */

export const RELATIVE_TIME = /(\d+[wdhm] ago|just now)/;

interface Guards {
  consoleErrors: string[];
  failedRequests: string[];
}

export const test = base.extend<{ guards: Guards }>({
  guards: [
    async ({ context, page }, use) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      const blockedUrls = new Set<string>();

      await context.route("**/*", (route) => {
        const url = new URL(route.request().url());
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          return route.continue();
        }
        blockedUrls.add(route.request().url());
        return route.abort();
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          const loc = msg.location()?.url ?? "";
          // Errors caused by our own third-party blocking are expected;
          // the browser reports them with the URL in location, not text.
          const fromBlocked =
            blockedUrls.has(loc) || [...blockedUrls].some((u) => text.includes(u));
          if (!fromBlocked) consoleErrors.push(text);
        }
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      page.on("requestfailed", (req) => {
        if (!blockedUrls.has(req.url())) {
          failedRequests.push(`${req.url()} → ${req.failure()?.errorText}`);
        }
      });
      page.on("response", (res) => {
        if (res.status() >= 400) {
          failedRequests.push(`${res.url()} → HTTP ${res.status()}`);
        }
      });

      await use({ consoleErrors, failedRequests });

      expect(consoleErrors, "console errors must be empty").toEqual([]);
      expect(failedRequests, "failed requests must be empty").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
