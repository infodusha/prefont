import fs from "node:fs";
import { dataFilePath, resolveOutDir } from "./paths.js";
import type { Config } from "./config.js";

export type { Config } from "./config.js";

export interface Data {
  generatedAt: string;
  configSource: string | null;
  config: Config;
}

export interface GetDataOptions {
  cwd?: string;
  outDir?: string;
}

export function getData(options: GetDataOptions = {}): Data {
  const cwd = options.cwd ?? process.cwd();
  const outDir = resolveOutDir(cwd, options.outDir);
  const file = dataFilePath(outDir);

  if (!fs.existsSync(file)) {
    throw new Error(`prefont: data file not found at ${file}. Run the \`prefont\` CLI first.`);
  }

  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw) as Data;
}
