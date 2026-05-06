import { measureCharWidths } from "./measure-char-widths.js";
import { sumCharWidths } from "./measure-from-data.js";

export interface MeasureFromCanvasOptions {
  family: string;
  weight: number;
  text: string;
  fontSize: number;
  fallback?: string;
}

export function measureTextFromCanvas(opts: MeasureFromCanvasOptions): number {
  const uniqueChars = [...new Set(opts.text)];
  const widths = measureCharWidths(opts.family, opts.weight, uniqueChars);
  return sumCharWidths(widths, opts.text, opts.fontSize, opts.fallback);
}
