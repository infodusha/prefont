import { chromium, firefox, webkit, type Browser, type BrowserType } from "playwright-core";
import { measureCharWidths } from "../client/measure-char-widths.js";
import type { BrowserName, Config, FontItem, SymbolSet } from "../core/schema.js";
import type { Data, FontMeasurement, WeightWidths } from "../client/index.js";
import { buildFontHtml } from "./font-loader.js";

const launchers: Record<BrowserName, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

function resolveSymbolSets(item: FontItem, config: Config): SymbolSet[] {
  if (!item.symbolSets) return config.symbolSets;
  return item.symbolSets.map((ref) => {
    if (typeof ref === "string") {
      const found = config.symbolSets.find((s) => s.name === ref);
      if (!found) {
        throw new Error(`Font "${item.family}" references unknown symbol set "${ref}"`);
      }
      return found;
    }
    return ref;
  });
}

function resolveBrowsers(item: FontItem, config: Config): BrowserName[] {
  return item.browsers ?? config.browsers;
}

async function measureFontInBrowser(
  browser: Browser,
  item: FontItem,
  configDir: string,
  symbolSets: SymbolSet[],
): Promise<WeightWidths> {
  const page = await browser.newPage();
  try {
    await page.setContent(await buildFontHtml(item, configDir));
    await page.addScriptTag({
      content: `window.__measureCharWidths=${measureCharWidths.toString()};`,
    });

    const result: WeightWidths = {};
    for (const weight of item.weights) {
      await page.evaluate(
        ([family, weight]) => document.fonts.load(`${weight} 16px "${family}"`),
        [item.family, weight],
      );

      const perSet: Record<string, Record<string, number>> = {};
      for (const set of symbolSets) {
        const widths = await page.evaluate(
          ({ family, weight, chars }) =>
            (
              window as unknown as {
                __measureCharWidths: (f: string, w: number, c: string[]) => Record<string, number>;
              }
            ).__measureCharWidths(family, weight, chars),
          { family: item.family, weight, chars: [...set.chars] },
        );
        perSet[set.name] = widths;
      }
      result[weight] = perSet;
    }
    return result;
  } finally {
    await page.close();
  }
}

export async function measure(config: Config, configDir: string): Promise<Data> {
  const browsersNeeded = new Set<BrowserName>();
  for (const item of config.fonts) {
    for (const b of resolveBrowsers(item, config)) browsersNeeded.add(b);
  }

  const browsers = new Map<BrowserName, Browser>();
  for (const name of browsersNeeded) {
    browsers.set(name, await launchers[name].launch());
  }

  try {
    const data: FontMeasurement[] = [];
    for (const item of config.fonts) {
      const sets = resolveSymbolSets(item, config);
      const itemBrowsers = resolveBrowsers(item, config);
      const browserResults: FontMeasurement["browsers"] = {};
      for (const name of itemBrowsers) {
        const browser = browsers.get(name)!;
        browserResults[name] = await measureFontInBrowser(browser, item, configDir, sets);
      }
      data.push({ family: item.family, browsers: browserResults });
    }

    return data;
  } finally {
    for (const browser of browsers.values()) {
      await browser.close();
    }
  }
}
