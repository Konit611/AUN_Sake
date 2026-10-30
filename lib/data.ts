import "server-only";

import { categories, subCategories } from "@/content/categories";
import { serveStyles } from "@/content/serve-styles";
import { foods } from "@/content/foods";
import { shochuBrands } from "@/content/brands/shochu";
import { beerBrands } from "@/content/brands/beer";
import { sakeBrands } from "@/content/brands/sake";
import { notes } from "@/content/notes";
import { validateContent } from "./validate";
import {
  PAIRING_LEVELS,
  type Brand,
  type BrandInput,
  type BrandServe,
  type Category,
  type CategoryId,
  type Food,
  type Pairing,
  type PairingNote,
  type ServeStyle,
  type SubCategory,
} from "./types";

const brandInputs: BrandInput[] = [...shochuBrands, ...beerBrands, ...sakeBrands];

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

// --- 分類 ---

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getSubCategories(categoryId?: CategoryId): SubCategory[] {
  return categoryId ? subCategories.filter((s) => s.categoryId === categoryId) : subCategories;
}

export function getSubCategory(id: string): SubCategory | undefined {
  return subCategoryById.get(id);
}

// --- 銘柄 ---

export function getBrands(): Brand[] {
  return brands;
}

export function getBrand(slug: string): Brand | undefined {
  return brandBySlug.get(slug);
}

export function getBrandsByCategory(categoryId: CategoryId): Brand[] {
  return brands.filter((b) => b.categoryId === categoryId);
}

export function getBrandsBySubCategory(subCategoryId: string): Brand[] {
  return brands.filter((b) => b.subCategoryId === subCategoryId);
}

/** 同じ小分類のほかの銘柄 */
export function getRelatedBrands(slug: string): Brand[] {
  const brand = brandBySlug.get(slug);
  if (!brand) return [];
  return brands.filter((b) => b.subCategoryId === brand.subCategoryId && b.slug !== slug);
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

export function getFood(slug: string): Food | undefined {
  return foodBySlug.get(slug);
}

// --- ペアリング ---

/** 阿吽 → 好相性 → 意外 の順 */
export function getPairings(brandSlug: string): Pairing[] {
  return pairings.filter((p) => p.brandSlug === brandSlug).sort(byLevel);
}

/** 銘柄ページの「飲み方別、息の合う肴」。銘柄の serves の順 */
export function getServePairings(brandSlug: string): Pairing[] {
  const brand = brandBySlug.get(brandSlug);
  if (!brand) return [];
  return brand.serves.flatMap((s) =>
    pairings.filter((p) => p.brandSlug === brandSlug && p.serveId === s.serveId).sort(byLevel),
  );
}

/** 肴 → 銘柄の逆引き */
export function getPairingsByFood(foodSlug: string): Pairing[] {
  return pairings.filter((p) => p.foodSlug === foodSlug).sort(byLevel);
}

// --- ペアリングノート ---

const sortedNotes = [...notes].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getNotes(): PairingNote[] {
  return sortedNotes;
}

export function getNote(slug: string): PairingNote | undefined {
  return notes.find((n) => n.slug === slug);
}

export function getNotesByBrand(brandSlug: string): PairingNote[] {
  return sortedNotes.filter((n) => n.brandSlug === brandSlug);
}
