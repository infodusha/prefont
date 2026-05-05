import fs from "node:fs/promises";
import path from "node:path";
import * as z from "zod";
import { configSchema, type Config } from "../core/schema.js";

export type { Config } from "../core/schema.js";

export const CONFIG_FILENAME = "prefontrc.json";

export async function loadConfig(cwd: string, override?: string): Promise<Config> {
  const configPath = path.resolve(cwd, override ?? CONFIG_FILENAME);

  try {
    await fs.access(configPath);
  } catch {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const raw = await fs.readFile(configPath, "utf8");
  const parsed = configSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid ${path.relative(cwd, configPath)}:\n${z.prettifyError(parsed.error)}`);
  }

  return parsed.data;
}
