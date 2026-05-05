#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { CONFIG_FILENAME, loadConfig } from "./config.js";
import { measure } from "./measure.js";

const { values } = parseArgs({
  strict: true,
  options: {
    config: { type: "string", short: "c" },
  },
});

const cwd = process.cwd();
const config = await loadConfig(cwd, values.config);
const configDir = path.dirname(path.resolve(cwd, values.config ?? CONFIG_FILENAME));
const outFile = path.resolve(cwd, config.out);

const data = await measure(config, configDir);

const contents = JSON.stringify(data, null, 2);
const bytes = Buffer.byteLength(contents, "utf8");

await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(outFile, contents, "utf8");

console.log(`prefont: wrote ${path.relative(cwd, outFile)} (${formatBytes(bytes)})\n`);

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / 1024 / 1024).toFixed(2)} MiB`;
}
