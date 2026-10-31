import "server-only";

import { buildStore, type Store } from "./data/store";
import { defaultLocale, type Locale } from "./i18n/config";
import type { Brand, BrandServe, CategoryId } from "./types";

// ページが使うデータの入口。いまは content/ のファイルから読むが、
// DB に移すときはこの関数の中身だけを差し替える（docs/plan/db-migration.md）。
// そのため、どれも async で locale を受け取る（いまは日本語だけ）。

const stores = new Map<Locale, Store>();

/** 言語ごとに一度だけ content/ を解決する */
function store(locale: Locale): Store {
  let s = stores.get(locale);
  if (!s) {
    s = buildStore(locale);
    stores.set(locale, s);
  }
  return s;
}

// 既定の言語はモジュール読み込み時に作る。content/ に問題があればここで落ちるので、dev でもビルドでも気づける
store(defaultLocale);

// --- 分類 ---

export async function getCategories(locale: Locale = defaultLocale) {
  return store(locale).getCategories();
}

export async function getCategory(id: string, locale: Locale = defaultLocale) {
  return store(locale).getCategory(id);
}

export async function getSubCategories(categoryId?: CategoryId, locale: Locale = defaultLocale) {
  return store(locale).getSubCategories(categoryId);
}

export async function getSubCategory(id: string, locale: Locale = defaultLocale) {
  return store(locale).getSubCategory(id);
}

/** 銘柄が 1 つ以上ある大分類 */
export async function getCategoriesWithBrands(locale: Locale = defaultLocale) {
  return store(locale).getCategoriesWithBrands();
}

/** 銘柄が 1 つ以上ある小分類（ページを作るのはこれだけ） */
export async function getSubCategoriesWithBrands(categoryId?: CategoryId, locale: Locale = defaultLocale) {
  return store(locale).getSubCategoriesWithBrands(categoryId);
}

// --- 銘柄 ---

export async function getBrands(locale: Locale = defaultLocale) {
  return store(locale).getBrands();
}

export async function getBrand(slug: string, locale: Locale = defaultLocale) {
  return store(locale).getBrand(slug);
}

export async function getBrandsByCategory(categoryId: CategoryId, locale: Locale = defaultLocale) {
  return store(locale).getBrandsByCategory(categoryId);
}

/** alsoIn で載せている銘柄も含む */
export async function getBrandsBySubCategory(subCategoryId: string, locale: Locale = defaultLocale) {
  return store(locale).getBrandsBySubCategory(subCategoryId);
}

/** 同じ小分類のほかの銘柄 */
export async function getRelatedBrands(slug: string, locale: Locale = defaultLocale) {
  return store(locale).getRelatedBrands(slug);
}

// --- 蔵元・産地 ---

export async function getMakers(locale: Locale = defaultLocale) {
  return store(locale).getMakers();
}

export async function getMaker(id: string, locale: Locale = defaultLocale) {
  return store(locale).getMaker(id);
}

/** 同じ蔵元の銘柄（霧島酒造 → 黒霧島・赤霧島） */
export async function getBrandsByMaker(makerId: string, locale: Locale = defaultLocale) {
  return store(locale).getBrandsByMaker(makerId);
}

export async function getRegions(locale: Locale = defaultLocale) {
  return store(locale).getRegions();
}

export async function getRegion(id: string, locale: Locale = defaultLocale) {
  return store(locale).getRegion(id);
}

// --- 飲み方・肴 ---

export async function getServeStyle(id: string, locale: Locale = defaultLocale) {
  return store(locale).getServeStyle(id);
}

/** 「お湯割り（焼酎6：お湯4）」 */
export async function formatServe(serve: BrandServe, locale: Locale = defaultLocale) {
  return store(locale).formatServe(serve);
}

/** 銘柄の serves のうち、おすすめの飲み方（データを読まない） */
export function getRecommendedServe(brand: Brand): BrandServe {
  return brand.serves.find((s) => s.serveId === brand.recommendedServe)!;
}

export async function getFoods(locale: Locale = defaultLocale) {
  return store(locale).getFoods();
}

export async function getFood(slug: string, locale: Locale = defaultLocale) {
  return store(locale).getFood(slug);
}

/** ペアリングがある肴（ページを作るのはこれだけ） */
export async function getFoodsWithPairings(locale: Locale = defaultLocale) {
  return store(locale).getFoodsWithPairings();
}

/** 銘柄の肴ジャンル。ペアリングした肴の genres を合わせたもの */
export async function getBrandFoodGenres(brandSlug: string, locale: Locale = defaultLocale) {
  return store(locale).getBrandFoodGenres(brandSlug);
}

// --- ペアリング ---

/** 阿吽 → 好相性 → 意外 の順 */
export async function getPairings(brandSlug: string, locale: Locale = defaultLocale) {
  return store(locale).getPairings(brandSlug);
}

/** 銘柄ページの「飲み方別、息の合う肴」。銘柄の serves の順 */
export async function getServePairings(brandSlug: string, locale: Locale = defaultLocale) {
  return store(locale).getServePairings(brandSlug);
}

/** 肴 → 銘柄の逆引き */
export async function getPairingsByFood(foodSlug: string, locale: Locale = defaultLocale) {
  return store(locale).getPairingsByFood(foodSlug);
}

// --- ペアリングノート ---

/** 新しい順 */
export async function getNotes(locale: Locale = defaultLocale) {
  return store(locale).getNotes();
}

export async function getNote(slug: string, locale: Locale = defaultLocale) {
  return store(locale).getNote(slug);
}

export async function getNotesByBrand(brandSlug: string, locale: Locale = defaultLocale) {
  return store(locale).getNotesByBrand(brandSlug);
}

/** 同じ銘柄か同じ肴のノート（自分は除く）。同じ銘柄を先に、それぞれ新しい順 */
export async function getRelatedNotes(slug: string, limit = 3, locale: Locale = defaultLocale) {
  return store(locale).getRelatedNotes(slug, limit);
}
