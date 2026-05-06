import type { BrowserName } from "../core/schema.js";

export type { BrowserName, Config, FontItem, SymbolSet } from "../core/schema.js";

export type CharWidths = Record<string, number>;
export type WeightWidths = Record<string, CharWidths>;
export type BrowserWidths = Partial<Record<BrowserName, WeightWidths>>;

export interface FontMeasurement {
  family: string;
  browsers: BrowserWidths;
}

export type PrefontData = FontMeasurement[];

export { measureTextFromData } from "./measure-from-data.js";
export { measureTextFromCanvas } from "./measure-from-canvas.js";
export { measureText } from "./measure-text.js";
