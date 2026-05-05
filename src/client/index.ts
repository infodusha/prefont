import type { BrowserName } from "../core/schema.ts";

export type { BrowserName, Config, FontItem, SymbolSet } from "../core/schema.ts";

export type CharWidths = Record<string, number>;
export type SymbolSetWidths = Record<string, CharWidths>;
export type WeightWidths = Record<string, SymbolSetWidths>;
export type BrowserWidths = Partial<Record<BrowserName, WeightWidths>>;

export interface FontMeasurement {
  family: string;
  browsers: BrowserWidths;
}

export type Data = FontMeasurement[];

export function getData(data: Data): Data {
  return data;
}
