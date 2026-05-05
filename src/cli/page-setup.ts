import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright-core";
import { html } from "./helpers.js";

const DIST_DIR = fileURLToPath(new URL("..", import.meta.url));
const ORIGIN = "https://prefont.local";
const INDEX_PATH = "/index.html";
const ENTRY_PATH = "/cli/entry.js";

export async function setupPage(page: Page, fontHtml: string): Promise<void> {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === INDEX_PATH) {
      await route.fulfill({
        contentType: "text/html",
        body: html`<!doctype html>
          <html>
            <head>
              ${fontHtml}
              <script type="module" src="${ENTRY_PATH}"></script>
            </head>
          </html>`,
      });
      return;
    }
    await route.fulfill({ path: path.join(DIST_DIR, pathname) });
  });
  await page.goto(`${ORIGIN}${INDEX_PATH}`);
  await page.waitForFunction(() => Boolean(window.__prefont));
}
