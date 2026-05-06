import { chromium, firefox, webkit, type Browser, type BrowserType } from "playwright-core";
import type { BrowserName } from "../core/schema.js";
import type { CharWidths, PrefontData, FontMeasurement, WeightWidths } from "../client/index.js";
import type { ResolvedFont } from "./config.js";
import { buildFontHtml } from "./font-loader.js";
import { setupPage } from "./page-setup.js";

const launchers: Record<BrowserName, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

async function measureFontInBrowser(
  browser: Browser,
  item: ResolvedFont,
  fontHtml: string,
): Promise<WeightWidths> {
  const page = await browser.newPage();
  try {
    await setupPage(page, fontHtml);

    const result: WeightWidths = {};
    for (const weight of item.weights) {
      await page.evaluate(
        ([family, weight]) => document.fonts.load(`${weight} 16px "${family}"`),
        [item.family, weight],
      );

      const merged: CharWidths = {};
      for (const set of item.symbolSets) {
        const widths = await page.evaluate(
          ({ family, weight, chars }) => window.__prefont.measureCharWidths(family, weight, chars),
          { family: item.family, weight, chars: [...set.chars] },
        );
        Object.assign(merged, widths);
      }
      result[weight] = merged;
    }
    return result;
  } finally {
    await page.close();
  }
}

export async function measure(fonts: ResolvedFont[], configDir: string): Promise<PrefontData> {
  const browsersNeeded = new Set<BrowserName>();
  for (const item of fonts) {
    for (const b of item.browsers) browsersNeeded.add(b);
  }

  const browserEntries = await Promise.all(
    [...browsersNeeded].map(async (n) => [n, await launchers[n].launch()] as const),
  );
  const browsers = new Map<BrowserName, Browser>(browserEntries);

  try {
    const fontHtmlByFont = new Map<ResolvedFont, string>(
      await Promise.all(
        fonts.map(async (item) => [item, await buildFontHtml(item, configDir)] as const),
      ),
    );

    return await Promise.all(
      fonts.map(async (item): Promise<FontMeasurement> => {
        const fontHtml = fontHtmlByFont.get(item)!;
        const entries = await Promise.all(
          item.browsers.map(async (name) => {
            const widths = await measureFontInBrowser(browsers.get(name)!, item, fontHtml);
            return [name, widths] as const;
          }),
        );
        return { family: item.family, browsers: Object.fromEntries(entries) };
      }),
    );
  } finally {
    await Promise.allSettled([...browsers.values()].map((b) => b.close()));
  }
}
