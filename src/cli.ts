#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadConfig } from "./config.js";
import { dataFilePath, resolveOutDir } from "./paths.js";

const HELP = `prefont — precompute data for the prefont runtime
 
Usage:
  prefont [options]

Options:
  -c, --config <path>   Path to config file (default: ./prefont.config.json)
  -o, --out <dir>       Output directory (default: ./.prefont)
  -h, --help            Show this help
`;

const { values } = parseArgs({
  options: {
    config: { type: "string", short: "c" },
    out: { type: "string", short: "o" },
    help: { type: "boolean", short: "h" },
  },
  strict: true,
});

if (values.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

const cwd = process.cwd();
const { config, source } = loadConfig(cwd, values.config);
const outDir = resolveOutDir(cwd, values.out);
const outFile = dataFilePath(outDir);

const data = {
  generatedAt: new Date().toISOString(),
  configSource: source,
  config,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n", "utf8");

process.stdout.write(`prefont: wrote ${path.relative(cwd, outFile)}\n`);
