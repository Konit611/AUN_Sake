// 対応言語。今は日本語だけで、言語を足すときはここに追加する（docs/plan/i18n.md）
export const locales = ["ja"] as const;
export type Locale = (typeof locales)[number];

/** 既定の言語。URL に接頭辞を付けない（/brands）。ほかの言語は /ko/brands のように付ける */
export const defaultLocale: Locale = "ja";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** <html lang> と OGP の locale */
export const htmlLang: Record<Locale, string> = { ja: "ja" };
export const ogLocale: Record<Locale, string> = { ja: "ja_JP" };
