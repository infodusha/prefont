import fs from "node:fs";
import path from "node:path";
import * as z from "zod";
import { configSchema, type Config } from "./schema.js";

export type { Config } from "./schema.js";

export const CONFIG_FILENAME = "prefontrc.json";

export function loadConfig(
  cwd: string,
  override?: string,
): {
  config: Config;
  source: string | null;
} {
  const configPath = override ? path.resolve(cwd, override) : path.resolve(cwd, CONFIG_FILENAME);

  if (!fs.existsSync(configPath)) {
    if (override) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    return { config: {}, source: null };
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = configSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid ${path.relative(cwd, configPath)}:\n${z.prettifyError(parsed.error)}`);
  }

  const config = parsed.data;
  delete config.$schema;
  return { config, source: configPath };
}
