import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as z from "zod";
import { configSchema } from "../src/core/schema.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "schema.json");

const jsonSchema = z.toJSONSchema(configSchema, {
  io: "input",
});

const doc = {
  $id: "https://raw.githubusercontent.com/infodusha/prefont/main/schema.json",
  title: "PrefontConfig",
  description: "Configuration for the prefont CLI (.prefontrc.json).",
  ...jsonSchema,
};

await fs.writeFile(out, JSON.stringify(doc), "utf8");
