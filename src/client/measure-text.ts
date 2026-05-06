import type { BrowserName } from "../core/schema.js";
import type { Data } from "./index.js";
import {
  measureTextFromCanvas,
  type MeasureFromCanvasOptions,
} from "./measure-from-canvas.js";
import { measureTextFromData } from "./measure-from-data.js";

export interface MeasureTextOptions extends MeasureFromCanvasOptions {
  data?: Data;
  browser?: BrowserName;
}

export function measureText(opts: MeasureTextOptions): number {
  if (typeof document !== "undefined") {
    return measureTextFromCanvas(opts);
  }
  if (!opts.data || !opts.browser) {
    throw new Error(
      "prefont: measureText running without a DOM requires both `data` and `browser`",
    );
  }
  return measureTextFromData(opts.data, {
    family: opts.family,
    browser: opts.browser,
    weight: opts.weight,
    text: opts.text,
    fontSize: opts.fontSize,
    fallback: opts.fallback,
  });
}
