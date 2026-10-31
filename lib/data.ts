import "server-only";

import { categories, subCategories } from "@/content/categories";
import { serveStyles } from "@/content/serve-styles";
import { foods } from "@/content/foods";
import { shochuBrands } from "@/content/brands/shochu";
import { beerBrands } from "@/content/brands/beer";
import { sakeBrands } from "@/content/brands/sake";
import { wineBrands } from "@/content/brands/wine";
import { notes } from "@/content/notes";
import { validateContent } from "./validate";
import {
  FOOD_GENRES,
  PAIRING_LEVELS,
  pairingId,
  type Brand,
  type BrandInput,
  type BrandServe,
  type Category,
  type CategoryId,
  type Food,
  type FoodGenre,
  type Pairing,
  type PairingNote,
  type ServeStyle,
  type SubCategory,
} from "./types";

const brandInputs: BrandInput[] = [...shochuBrands, ...beerBrands, ...sakeBrands, ...wineBrands];

// 参照ミスがあればここで落ちるので、dev でもビルドでも気づける
const errors = validateContent({
  categories,
  subCategories,
  serveStyles,
  foods,
  brands: brandInputs,
  notes,
});
if (errors.length > 0) {
  throw new Error(`content/ に問題があります:\n- ${errors.join("\n- ")}`);
}

const subCategoryById = new Map(subCategories.map((s) => [s.id, s]));
const foodBySlug = new Map(foods.map((f) => [f.slug, f]));
const serveById = new Map(serveStyles.map((s) => [s.id, s]));

const brands: Brand[] = brandInputs.map((input) => {
  const { pairings, ...b } = input;
  void pairings;
  return { ...b, categoryId: subCategoryById.get(b.subCategoryId)!.categoryId };
});
const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

const pairings: Pairing[] = brandInputs.flatMap((b) =>
  b.pairings.map((p, i) => ({
    id: pairingId(b.slug, p.food, p.serve),
    brandSlug: b.slug,
    foodSlug: p.food,
    level: p.level,
    why: p.why,
    serveId: p.serve,
    order: i,
  })),
);

const byLevel = (a: Pairing, b: Pairing) =>
  PAIRING_LEVELS[a.level].order - PAIRING_LEVELS[b.level].order || a.order - b.order;

// --- 索引 ---
// 呼び出しのたびに配列全体を走査しないよう、モジュール読み込み時に一度だけ作る。
// 返す配列は readonly（呼び出し側の sort などで共有データを壊さないため）。

function groupBy<T>(items: readonly T[], keys: (item: T) => readonly string[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    for (const key of keys(item)) {
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
  }
  return map;
}

const NONE: readonly never[] = [];

const categoryById = new Map(categories.map((c) => [c.id, c]));
const subCategoriesByCategory = groupBy(subCategories, (s) => [s.categoryId]);
const brandsByCategory = groupBy(brands, (b) => [b.categoryId]);
/** alsoIn で載せている銘柄も含む */
const brandsBySubCategory = groupBy(brands, (b) => [b.subCategoryId, ...(b.alsoIn ?? [])]);
const pairingsByBrand = groupBy(pairings, (p) => [p.brandSlug]);
const pairingsByFood = groupBy(pairings, (p) => [p.foodSlug]);
for (const list of [...pairingsByBrand.values(), ...pairingsByFood.values()]) list.sort(byLevel);

// draft のノートはページも一覧も作らない（検証だけはする）
const publishedNotes = notes.filter((n) => !n.draft);
const sortedNotes = [...publishedNotes].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const noteBySlug = new Map(publishedNotes.map((n) => [n.slug, n]));
const notesByBrand = groupBy(sortedNotes, (n) => [n.brandSlug]);

// --- 分類 ---

export function getCategories(): readonly Category[] {
  return categories;
}

export function getCategory(id: string): Category | undefined {
  return categoryById.get(id as CategoryId);
}

export function getSubCategories(categoryId?: CategoryId): readonly SubCategory[] {
  return categoryId ? (subCategoriesByCategory.get(categoryId) ?? NONE) : subCategories;
}

export function getSubCategory(id: string): SubCategory | undefined {
  return subCategoryById.get(id);
}

/** 銘柄が 1 つ以上ある大分類 */
export function getCategoriesWithBrands(): readonly Category[] {
  return categories.filter((c) => brandsByCategory.has(c.id));
}

/** 銘柄が 1 つ以上ある小分類（ページを作るのはこれだけ） */
export function getSubCategoriesWithBrands(categoryId?: CategoryId): readonly SubCategory[] {
  return getSubCategories(categoryId).filter((s) => brandsBySubCategory.has(s.id));
}

// --- 銘柄 ---

export function getBrands(): readonly Brand[] {
  return brands;
}

export function getBrand(slug: string): Brand | undefined {
  return brandBySlug.get(slug);
}

export function getBrandsByCategory(categoryId: CategoryId): readonly Brand[] {
  return brandsByCategory.get(categoryId) ?? NONE;
}

/** alsoIn で載せている銘柄も含む */
export function getBrandsBySubCategory(subCategoryId: string): readonly Brand[] {
  return brandsBySubCategory.get(subCategoryId) ?? NONE;
}

/** 同じ小分類のほかの銘柄 */
export function getRelatedBrands(slug: string): readonly Brand[] {
  const brand = brandBySlug.get(slug);
  if (!brand) return NONE;
  return getBrandsBySubCategory(brand.subCategoryId).filter((b) => b.slug !== slug);
}

// --- 飲み方・肴 ---

export function getServeStyle(id: string): ServeStyle | undefined {
  return serveById.get(id);
}

/** 「お湯割り（焼酎6：お湯4）」 */
export function formatServe(serve: BrandServe): string {
  const name = serveById.get(serve.serveId)!.name;
  return serve.how ? `${name}（${serve.how}）` : name;
}

export function getRecommendedServe(brand: Brand): BrandServe {
  return brand.serves.find((s) => s.serveId === brand.recommendedServe)!;
}

export function getFoods(): readonly Food[] {
  return foods;
}

export function getFood(slug: string): Food | undefined {
  return foodBySlug.get(slug);
}

/** ペアリングがある肴（ページを作るのはこれだけ） */
export function getFoodsWithPairings(): readonly Food[] {
  return foods.filter((f) => pairingsByFood.has(f.slug));
}

/** 銘柄の肴ジャンル。ペアリングした肴の genres を合わせたもの */
export function getBrandFoodGenres(brandSlug: string): FoodGenre[] {
  const genres = new Set(getPairings(brandSlug).flatMap((p) => foodBySlug.get(p.foodSlug)!.genres));
  return FOOD_GENRES.filter((g) => genres.has(g));
}

// --- ペアリング ---

/** 阿吽 → 好相性 → 意外 の順 */
export function getPairings(brandSlug: string): readonly Pairing[] {
  return pairingsByBrand.get(brandSlug) ?? NONE;
}

/** 銘柄ページの「飲み方別、息の合う肴」。銘柄の serves の順 */
export function getServePairings(brandSlug: string): readonly Pairing[] {
  const brand = brandBySlug.get(brandSlug);
  if (!brand) return NONE;
  const list = getPairings(brandSlug);
  return brand.serves.flatMap((s) => list.filter((p) => p.serveId === s.serveId));
}

/** 肴 → 銘柄の逆引き */
export function getPairingsByFood(foodSlug: string): readonly Pairing[] {
  return pairingsByFood.get(foodSlug) ?? NONE;
}

// --- ペアリングノート ---

/** 新しい順 */
export function getNotes(): readonly PairingNote[] {
  return sortedNotes;
}

export function getNote(slug: string): PairingNote | undefined {
  return noteBySlug.get(slug);
}

export function getNotesByBrand(brandSlug: string): readonly PairingNote[] {
  return notesByBrand.get(brandSlug) ?? NONE;
}

/** 同じ銘柄か同じ肴のノート（自分は除く）。同じ銘柄を先に、それぞれ新しい順 */
export function getRelatedNotes(slug: string, limit = 3): readonly PairingNote[] {
  const note = noteBySlug.get(slug);
  if (!note) return NONE;
  const sameBrand = sortedNotes.filter((n) => n.brandSlug === note.brandSlug && n.slug !== slug);
  const sameFood = sortedNotes.filter(
    (n) => n.foodSlug === note.foodSlug && n.brandSlug !== note.brandSlug,
  );
  return [...sameBrand, ...sameFood].slice(0, limit);
}
