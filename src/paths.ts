import path from "node:path";

export const DEFAULT_OUT_DIR = ".prefont";
export const DATA_FILE = "data.json";

export function resolveOutDir(cwd: string, override?: string): string {
  return path.resolve(cwd, override ?? DEFAULT_OUT_DIR);
}

export function dataFilePath(outDir: string): string {
  return path.join(outDir, DATA_FILE);
}
