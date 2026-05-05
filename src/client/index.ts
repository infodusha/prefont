export type { Config } from "../core/schema.ts";

export interface Data {
  generatedAt: string;
  configSource: string | null;
}

export function getData(data: Data): Data {
  return data;
}
