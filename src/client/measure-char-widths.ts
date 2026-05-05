const SIZE = 1000;

export function measureCharWidths(
  family: string,
  weight: string,
  chars: string[],
): Record<string, number> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${weight} ${SIZE}px "${family}"`;
  const widths: Record<string, number> = {};
  for (const ch of chars) {
    const width = ctx.measureText(ch).width / SIZE;
    widths[ch] = Math.round(width * 10000) / 10000;
  }
  return widths;
}
