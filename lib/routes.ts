import { defaultLocale, type Locale } from "./i18n/config";

// サイト内の URL はここで作る。既定の言語は接頭辞なし（/brands）、ほかは /ko/brands

export function localePath(path: string, locale: Locale = defaultLocale): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

const withHash = (path: string, hash?: string) => (hash ? `${path}#${hash}` : path);

export const paths = {
  home: (locale?: Locale, hash?: string) => withHash(localePath("/", locale), hash),
  /** search は "?kind=wine" のような文字列（lib/brand-filter.ts の filtersToSearch） */
  brands: (locale?: Locale, search = "") => `${localePath("/brands", locale)}${search}`,
  brand: (slug: string, locale?: Locale) => localePath(`/brands/${slug}`, locale),
  categories: (locale?: Locale, hash?: string) => withHash(localePath("/categories", locale), hash),
  category: (id: string, locale?: Locale) => localePath(`/categories/${id}`, locale),
  foods: (locale?: Locale) => localePath("/foods", locale),
  food: (slug: string, locale?: Locale) => localePath(`/foods/${slug}`, locale),
  notes: (locale?: Locale) => localePath("/notes", locale),
  note: (slug: string, locale?: Locale) => localePath(`/notes/${slug}`, locale),
  notesFeed: (locale?: Locale) => localePath("/notes/feed.xml", locale),
  search: (locale?: Locale, q?: string) =>
    `${localePath("/search", locale)}${q ? `?q=${encodeURIComponent(q)}` : ""}`,
};
