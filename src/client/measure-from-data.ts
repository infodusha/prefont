import type { BrowserName } from "../core/schema.js";
import type { CharWidths, Data } from "./index.js";

export interface CharWidthsSelector {
  family: string;
  browser: BrowserName;
  weight: number;
}

export interface MeasureFromDataOptions extends CharWidthsSelector {
  text: string;
  fontSize: number;
}

export interface MeasureAllWeightsOptions {
  family: string;
  browser: BrowserName;
  text: string;
  fontSize: number;
}

export function getCharWidths(data: Data, opts: CharWidthsSelector): CharWidths {
  const font = data.find((f) => f.family === opts.family);
  if (!font) {
    throw new Error(`prefont: family "${opts.family}" not found in data`);
  }
  const weights = font.browsers[opts.browser];
  if (!weights) {
    throw new Error(`prefont: browser "${opts.browser}" not measured for family "${opts.family}"`);
  }
  const sets = weights[opts.weight];
  if (!sets) {
    throw new Error(
      `prefont: weight ${opts.weight} not measured for "${opts.family}" on ${opts.browser}`,
    );
  }
  const merged: CharWidths = {};
  for (const setWidths of Object.values(sets)) {
    Object.assign(merged, setWidths);
  }
  return merged;
}

export function sumCharWidths(widths: CharWidths, text: string, fontSize: number): number {
  let total = 0;
  for (const ch of text) {
    const w = widths[ch];
    if (w === undefined) {
      throw new Error(`prefont: character ${JSON.stringify(ch)} not present in measured widths`);
    }
    total += w;
  }
  return total * fontSize;
}

export function measureTextFromData(data: Data, opts: MeasureFromDataOptions): number {
  const widths = getCharWidths(data, opts);
  return sumCharWidths(widths, opts.text, opts.fontSize);
}

export function measureTextAllWeights(
  data: Data,
  opts: MeasureAllWeightsOptions,
): Record<number, number> {
  const font = data.find((f) => f.family === opts.family);
  if (!font) {
    throw new Error(`prefont: family "${opts.family}" not found in data`);
  }
  const weights = font.browsers[opts.browser];
  if (!weights) {
    throw new Error(`prefont: browser "${opts.browser}" not measured for family "${opts.family}"`);
  }
  const result: Record<number, number> = {};
  for (const [weight, sets] of Object.entries(weights)) {
    const merged: CharWidths = {};
    for (const setWidths of Object.values(sets)) {
      Object.assign(merged, setWidths);
    }
    result[Number(weight)] = sumCharWidths(merged, opts.text, opts.fontSize);
  }
  return result;
}
