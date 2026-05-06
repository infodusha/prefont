const SIZE = 1000; // Highest possible
export const SCALE = 10 ** 8;

export function measureCharWidths(
  family: string,
  weight: number,
  chars: string[],
): Record<string, number> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${weight} ${SIZE}px "${family}"`;
  const widths: Record<string, number> = {};
  for (const ch of chars) {
    widths[ch] = Math.round((ctx.measureText(ch).width * SCALE) / SIZE);
  }
  return widths;
}
