import fs from "node:fs/promises";
import path from "node:path";
import type { FontItem } from "../core/schema.js";

const FORMATS: Record<string, { format: string; mime: string }> = {
  ".woff2": { format: "woff2", mime: "font/woff2" },
  ".woff": { format: "woff", mime: "font/woff" },
  ".ttf": { format: "truetype", mime: "font/ttf" },
  ".otf": { format: "opentype", mime: "font/otf" },
};

function isUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export async function buildFontHtml(item: FontItem, configDir: string): Promise<string> {
  if (isUrl(item.font)) {
    return `<link rel="stylesheet" href="${item.font}">`;
  }

  const filePath = path.resolve(configDir, item.font);
  const ext = path.extname(filePath).toLowerCase();
  const fmt = FORMATS[ext];
  if (!fmt) {
    throw new Error(`Unsupported font file extension: ${ext} (${filePath})`);
  }

  const buffer = await fs.readFile(filePath);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${fmt.mime};base64,${base64}`;

  const faces = item.weights
    .map(
      (weight) => css`
        @font-face {
          font-family: "${item.family}";
          font-weight: ${weight};
          font-style: normal;
          src: url(${dataUrl}) format("${fmt.format}");
          display: block;
        }
      `,
    )
    .join("");

  return `<style>${faces}</style>`;
}

const css = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);
