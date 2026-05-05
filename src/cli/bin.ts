#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadConfig } from "./config.js";
import { dataFilePath, resolveOutDir } from "../core/paths.js";

const { values } = parseArgs({
  strict: true,
  options: {
    config: { type: "string", short: "c" },
    out: { type: "string", short: "o" },
  },
});

const cwd = process.cwd();
const config = await loadConfig(cwd, values.config);
const outDir = resolveOutDir(cwd, values.out);
const outFile = dataFilePath(outDir);

const data = {
  generatedAt: new Date().toISOString(),
  config,
};

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outFile, JSON.stringify(data, null, 2) + "\n", "utf8");

console.log(`prefont: wrote ${path.relative(cwd, outFile)}\n`);
