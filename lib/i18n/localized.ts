import { defaultLocale, type Locale } from "./config";

/**
 * 翻訳できる値。content/ ではそのまま書けば既定の言語（日本語）、
 * 訳を足すときは { ja: "…", ko: "…" } と書く。訳がない言語では日本語を出す。
 */
export type Localized<T = string> = T | ({ [K in typeof defaultLocale]: T } & Partial<Record<Locale, T>>);

function isTranslations<T>(value: Localized<T>): value is { ja: T } & Partial<Record<Locale, T>> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && defaultLocale in value;
}

export function localize<T>(value: Localized<T>, locale: Locale): T;
export function localize<T>(value: Localized<T> | undefined, locale: Locale): T | undefined;
export function localize<T>(value: Localized<T> | undefined, locale: Locale): T | undefined {
  if (value === undefined) return undefined;
  if (!isTranslations(value)) return value;
  return value[locale] ?? value[defaultLocale];
}
