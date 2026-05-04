import fs from "node:fs";
import path from "node:path";

export const CONFIG_FILENAME = "prefont.config.json";
export interface Config {
  [key: string]: unknown;
}

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
  const config = JSON.parse(raw) as Config;
  return { config, source: configPath };
}
