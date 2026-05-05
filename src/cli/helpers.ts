export const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);

export const css = (strings: TemplateStringsArray, ...values: unknown[]) =>
  String.raw({ raw: strings }, ...values);

const SIZES = ["B", "KB", "MB", "GB"] as const;
const K = 1024;
const DECIMALS = 2;

export function getFileSize(bytes: number) {
  const unit = Math.floor(Math.log(bytes) / Math.log(K));
  return `${parseFloat((bytes / K ** unit).toFixed(DECIMALS))} ${SIZES[unit]}`;
}
