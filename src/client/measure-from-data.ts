import type { BrowserName } from "../core/schema.js";
import type { CharWidths, PrefontData } from "./index.js";
import { SCALE } from "./measure-char-widths.js";

export interface CharWidthsSelector {
  family: string;
  browser: BrowserName;
  weight: number;
}

export interface MeasureFromDataOptions extends CharWidthsSelector {
  text: string;
  fontSize: number;
  fallback?: string;
}

export interface MeasureAllWeightsOptions {
  family: string;
  browser: BrowserName;
  text: string;
  fontSize: number;
  fallback?: string;
}

export function getCharWidths(data: PrefontData, opts: CharWidthsSelector): CharWidths {
  const font = data.find((f) => f.family === opts.family);
  if (!font) {
    throw new Error(`prefont: family "${opts.family}" not found in data`);
  }
  const weights = font.browsers[opts.browser];
  if (!weights) {
    throw new Error(`prefont: browser "${opts.browser}" not measured for family "${opts.family}"`);
  }
  const widths = weights[opts.weight];
  if (!widths) {
    throw new Error(
      `prefont: weight ${opts.weight} not measured for "${opts.family}" on ${opts.browser}`,
    );
  }
  return widths;
}

export function sumCharWidths(
  widths: CharWidths,
  text: string,
  fontSize: number,
  fallback?: string,
): number {
  let fallbackWidth: number | undefined;
  if (fallback !== undefined) {
    fallbackWidth = widths[fallback];
    if (fallbackWidth === undefined) {
      throw new Error(
        `prefont: fallback character ${JSON.stringify(fallback)} not present in measured widths`,
      );
    }
  }
  let total = 0;
  for (const ch of text) {
    const w = widths[ch] ?? fallbackWidth;
    if (w === undefined) {
      throw new Error(`prefont: character ${JSON.stringify(ch)} not present in measured widths`);
    }
    total += w;
  }
  return (total * fontSize) / SCALE;
}

export function measureTextFromData(data: PrefontData, opts: MeasureFromDataOptions): number {
  const widths = getCharWidths(data, opts);
  return sumCharWidths(widths, opts.text, opts.fontSize, opts.fallback);
}
