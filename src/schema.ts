import * as z from "zod";

export const configSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().optional().describe("test"),
  fonts: z.array(z.string()).optional(),
});

export type Config = z.infer<typeof configSchema>;
