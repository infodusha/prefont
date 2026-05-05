import * as z from "zod";

const browserSchema = z
  .enum(["chromium", "firefox", "webkit"])
  .describe("Browser engine to measure fonts in.");

const symbolSetSchema = z.object({
  name: z.string().describe("Unique identifier used to reference this set from font items."),
  chars: z.string().describe("String of characters to measure as part of this set."),
});

const fontItemSchema = z.object({
  font: z.string().describe("Path to the font file, resolved relative to the config file."),
  family: z.string().describe("CSS font-family name to register and measure."),
  weights: z
    .array(z.number().int().min(1).max(1000))
    .nonempty()
    .describe("Font weights to measure (1-1000, e.g. 400, 700)."),
  browsers: z
    .array(browserSchema)
    .nonempty()
    .optional()
    .describe("Override the top-level browsers list for this font."),
  symbolSets: z
    .array(z.string().describe("The name of a top-level symbolSets entry."))
    .nonempty()
    .optional()
    .describe("Override the top-level symbol sets for this font."),
});

export const configSchema = z.object({
  $schema: z.string().optional().describe("JSON Schema reference for editor tooling."),
  out: z
    .string()
    .default(".prefont/data.json")
    .describe("Output file path for generated data, relative to the config file."),
  browsers: z
    .array(browserSchema)
    .nonempty()
    .describe("Default browsers used to measure every font."),
  symbolSets: z
    .array(symbolSetSchema)
    .nonempty()
    .describe("Reusable symbol set definitions referenced by fonts."),
  fonts: z.array(fontItemSchema).nonempty().describe("Fonts to measure."),
});

export type Config = z.infer<typeof configSchema>;
export type FontItem = z.infer<typeof fontItemSchema>;
export type BrowserName = z.infer<typeof browserSchema>;
export type SymbolSet = z.infer<typeof symbolSetSchema>;
