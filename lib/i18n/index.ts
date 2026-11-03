import { type Locale } from "./config";
import { ja, type Dictionary } from "./dictionaries/ja";

export { defaultLocale, htmlLang, isLocale, locales, ogLocale, type Locale } from "./config";
export { localize, type Localized } from "./localized";
export type { Dictionary } from "./dictionaries/ja";

const dictionaries: Record<Locale, Dictionary> = { ja };

/** 画面の文言。サーバーでもクライアントでも呼べる（辞書は小さいので全言語ぶん同梱） */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** "{name}に合うお酒" の {name} を埋める */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all));
}

/** 公開日（YYYY-MM-DD）の表示。日本語は 2026.10.30 */
export function formatDate(isoDate: string, locale: Locale): string {
  switch (locale) {
    case "ja":
      return isoDate.replaceAll("-", ".");
  }
}
