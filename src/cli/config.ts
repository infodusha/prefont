import fs from "node:fs/promises";
import path from "node:path";
import * as z from "zod";
import { configSchema, type BrowserName, type SymbolSet } from "../core/schema.js";

export interface ResolvedFont {
  font: string;
  family: string;
  weights: number[];
  browsers: BrowserName[];
  symbolSets: SymbolSet[];
}

export interface Config {
  configDir: string;
  outFile: string;
  fonts: ResolvedFont[];
}

export async function loadConfig(cwd: string, filename: string): Promise<Config> {
  const configPath = path.resolve(cwd, filename);

  const data = await readConfig(cwd, configPath);

  const symbolSetByName = new Map(data.symbolSets.map((s) => [s.name, s]));
  const fonts = data.fonts.map((item) => {
    const symbolSets = item.symbolSets
      ? item.symbolSets.map((name) => {
          const found = symbolSetByName.get(name);
          if (!found) {
            throw new Error(`Font "${item.family}" references unknown symbol set "${name}"`);
          }
          return found;
        })
      : data.symbolSets;

    return {
      font: item.font,
      family: item.family,
      weights: item.weights,
      browsers: item.browsers ?? data.browsers,
      symbolSets,
    };
  });

  return {
    configDir: path.dirname(configPath),
    outFile: path.resolve(cwd, data.out),
    fonts,
  };
}

async function readConfig(cwd: string, configPath: string) {
  let raw: string;
  try {
    raw = await fs.readFile(configPath, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Config file not found: ${configPath}`);
    }
    throw e;
  }

  const parsed = configSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid ${path.relative(cwd, configPath)}:\n${z.prettifyError(parsed.error)}`);
  }

  return parsed.data;
}
