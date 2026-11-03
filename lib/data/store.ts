import {
  categories as categorySources,
  subCategories as subCategorySources,
} from "@/content/categories";
import { serveStyles as serveStyleSources } from "@/content/serve-styles";
import { makers as makerSources } from "@/content/makers";
import { regions as regionSources } from "@/content/regions";
import { foods as foodSources } from "@/content/foods";
import { shochuBrands } from "@/content/brands/shochu";
import { beerBrands } from "@/content/brands/beer";
import { sakeBrands } from "@/content/brands/sake";
import { wineBrands } from "@/content/brands/wine";
import { notes as noteSources } from "@/content/notes";
import type { Locale } from "../i18n/config";
import { localize } from "../i18n/localized";
import { validateContent } from "../validate";
import {
  FOOD_GENRES,
  PAIRING_LEVELS,
  pairingId,
  type Brand,
  type BrandInput,
  type BrandSource,
  type BrandServe,
  type Category,
  type CategoryId,
  type Food,
  type Maker,
  type Region,
  type FoodGenre,
  type Pairing,
  type PairingNote,
  type ServeStyle,
  type SubCategory,
} from "../types";

// content/ を 1 つの言語の文字列に解決して、索引を作り、同期の参照関数を返す。
// lib/data.ts（async の公開関数）からだけ使う。DB に移したら、このファイルは DB のクエリに置き換わる。

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

export type Store = ReturnType<typeof buildStore>;

export function buildStore(L: Locale) {
  // --- content/ の訳せる文字列を、表示する言語の文字列にする ---

  const categories: Category[] = categorySources.map((c) => ({
    ...c,
    name: localize(c.name, L),
    lead: localize(c.lead, L),
    chart: c.chart && {
      axes: c.chart.axes.map((a) => ({ ...a, label: localize(a.label, L) })),
    },
  }));
  const subCategories: SubCategory[] = subCategorySources.map((s) => ({
    ...s,
    name: localize(s.name, L),
    meta: localize(s.meta, L),
    taste: localize(s.taste, L),
    pair: localize(s.pair, L),
  }));
  const serveStyles: ServeStyle[] = serveStyleSources.map((s) => ({
    ...s,
    name: localize(s.name, L),
  }));
  const regions: Region[] = regionSources.map((r) => ({
    ...r,
    name: localize(r.name, L),
  }));
  const makers: Maker[] = makerSources.map((m) => ({
    ...m,
    name: localize(m.name, L),
  }));
  const foods: Food[] = foodSources.map((f) => ({
    ...f,
    name: localize(f.name, L),
  }));
  const brandSources: BrandSource[] = [
    ...shochuBrands,
    ...beerBrands,
    ...sakeBrands,
    ...wineBrands,
  ];
  const brandInputs: BrandInput[] = brandSources.map((b) => ({
    ...b,
    name: localize(b.name, L),
    taste: localize(b.taste, L),
    tags: localize(b.tags, L),
    avoid: localize(b.avoid, L),
    serves: b.serves.map((s) => ({
      ...s,
      how: localize(s.how, L),
      note: localize(s.note, L),
    })),
    pairings: b.pairings.map((p) => ({ ...p, why: localize(p.why, L) })),
  }));
  const notes: PairingNote[] = noteSources.map((n) => ({
    ...n,
    title: localize(n.title, L),
    author: localize(n.author, L),
    lead: localize(n.lead, L),
    quote: localize(n.quote, L),
  }));

  // 参照ミスがあればここで落ちるので、dev でもビルドでも気づける
  const errors = validateContent({
    categories,
    subCategories,
    serveStyles,
    regions,
    makers,
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

  const regionById = new Map(regions.map((r) => [r.id, r]));
  const makerById = new Map(makers.map((m) => [m.id, m]));

  const brands: Brand[] = brandInputs.map((input) => {
    const { pairings, regionId, ...b } = input;
    void pairings;
    const maker = makerById.get(b.makerId)!;
    const region = regionById.get(regionId ?? maker.regionId)!;
    return {
      ...b,
      categoryId: subCategoryById.get(b.subCategoryId)!.categoryId,
      maker: maker.name,
      regionId: region.id,
      region: region.name,
    };
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
  // 呼び出しのたびに配列全体を走査しないよう、言語ごとに一度だけ作る。
  // 返す配列は readonly（呼び出し側の sort などで共有データを壊さないため）。

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const subCategoriesByCategory = groupBy(subCategories, (s) => [s.categoryId]);
  const brandsByCategory = groupBy(brands, (b) => [b.categoryId]);
  const brandsByMaker = groupBy(brands, (b) => [b.makerId]);
  /** alsoIn で載せている銘柄も含む */
  const brandsBySubCategory = groupBy(brands, (b) => [b.subCategoryId, ...(b.alsoIn ?? [])]);
  const pairingsByBrand = groupBy(pairings, (p) => [p.brandSlug]);
  const pairingsByFood = groupBy(pairings, (p) => [p.foodSlug]);
  for (const list of [...pairingsByBrand.values(), ...pairingsByFood.values()]) list.sort(byLevel);

  // draft のノートはページも一覧も作らない（検証だけはする）
  const publishedNotes = notes.filter((n) => !n.draft);
  const sortedNotes = [...publishedNotes].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  const noteBySlug = new Map(publishedNotes.map((n) => [n.slug, n]));
  const notesByBrand = groupBy(sortedNotes, (n) => [n.brandSlug]);

  // --- 分類 ---

  function getCategories(): readonly Category[] {
    return categories;
  }

  function getCategory(id: string): Category | undefined {
    return categoryById.get(id as CategoryId);
  }

  function getSubCategories(categoryId?: CategoryId): readonly SubCategory[] {
    return categoryId ? (subCategoriesByCategory.get(categoryId) ?? NONE) : subCategories;
  }

  function getSubCategory(id: string): SubCategory | undefined {
    return subCategoryById.get(id);
  }

  /** 銘柄が 1 つ以上ある大分類 */
  function getCategoriesWithBrands(): readonly Category[] {
    return categories.filter((c) => brandsByCategory.has(c.id));
  }

  /** 銘柄が 1 つ以上ある小分類（ページを作るのはこれだけ） */
  function getSubCategoriesWithBrands(categoryId?: CategoryId): readonly SubCategory[] {
    return getSubCategories(categoryId).filter((s) => brandsBySubCategory.has(s.id));
  }

  // --- 銘柄 ---

  function getBrands(): readonly Brand[] {
    return brands;
  }

  function getBrand(slug: string): Brand | undefined {
    return brandBySlug.get(slug);
  }

  function getBrandsByCategory(categoryId: CategoryId): readonly Brand[] {
    return brandsByCategory.get(categoryId) ?? NONE;
  }

  /** alsoIn で載せている銘柄も含む */
  function getBrandsBySubCategory(subCategoryId: string): readonly Brand[] {
    return brandsBySubCategory.get(subCategoryId) ?? NONE;
  }

  /** 同じ小分類のほかの銘柄 */
  function getRelatedBrands(slug: string): readonly Brand[] {
    const brand = brandBySlug.get(slug);
    if (!brand) return NONE;
    return getBrandsBySubCategory(brand.subCategoryId).filter((b) => b.slug !== slug);
  }

  // --- 蔵元・産地 ---

  function getMakers(): readonly Maker[] {
    return makers;
  }

  function getMaker(id: string): Maker | undefined {
    return makerById.get(id);
  }

  /** 同じ蔵元の銘柄（霧島酒造 → 黒霧島・赤霧島） */
  function getBrandsByMaker(makerId: string): readonly Brand[] {
    return brandsByMaker.get(makerId) ?? NONE;
  }

  function getRegions(): readonly Region[] {
    return regions;
  }

  function getRegion(id: string): Region | undefined {
    return regionById.get(id);
  }

  // --- 飲み方・肴 ---

  function getServeStyle(id: string): ServeStyle | undefined {
    return serveById.get(id);
  }

  /** 「お湯割り（焼酎6：お湯4）」 */
  function formatServe(serve: BrandServe): string {
    const name = serveById.get(serve.serveId)!.name;
    return serve.how ? `${name}（${serve.how}）` : name;
  }

  function getFoods(): readonly Food[] {
    return foods;
  }

  function getFood(slug: string): Food | undefined {
    return foodBySlug.get(slug);
  }

  /** ペアリングがある肴（ページを作るのはこれだけ） */
  function getFoodsWithPairings(): readonly Food[] {
    return foods.filter((f) => pairingsByFood.has(f.slug));
  }

  /** 銘柄の肴ジャンル。ペアリングした肴の genres を合わせたもの */
  function getBrandFoodGenres(brandSlug: string): FoodGenre[] {
    const genres = new Set(
      getPairings(brandSlug).flatMap((p) => foodBySlug.get(p.foodSlug)!.genres),
    );
    return FOOD_GENRES.filter((g) => genres.has(g));
  }

  // --- ペアリング ---

  /** 阿吽 → 好相性 → 意外 の順 */
  function getPairings(brandSlug: string): readonly Pairing[] {
    return pairingsByBrand.get(brandSlug) ?? NONE;
  }

  /** 銘柄ページの「飲み方別、息の合う肴」。銘柄の serves の順 */
  function getServePairings(brandSlug: string): readonly Pairing[] {
    const brand = brandBySlug.get(brandSlug);
    if (!brand) return NONE;
    const list = getPairings(brandSlug);
    return brand.serves.flatMap((s) => list.filter((p) => p.serveId === s.serveId));
  }

  /** 肴 → 銘柄の逆引き */
  function getPairingsByFood(foodSlug: string): readonly Pairing[] {
    return pairingsByFood.get(foodSlug) ?? NONE;
  }

  // --- ペアリングノート ---

  /** 新しい順 */
  function getNotes(): readonly PairingNote[] {
    return sortedNotes;
  }

  function getNote(slug: string): PairingNote | undefined {
    return noteBySlug.get(slug);
  }

  function getNotesByBrand(brandSlug: string): readonly PairingNote[] {
    return notesByBrand.get(brandSlug) ?? NONE;
  }

  /** 同じ銘柄か同じ肴のノート（自分は除く）。同じ銘柄を先に、それぞれ新しい順 */
  function getRelatedNotes(slug: string, limit = 3): readonly PairingNote[] {
    const note = noteBySlug.get(slug);
    if (!note) return NONE;
    const sameBrand = sortedNotes.filter((n) => n.brandSlug === note.brandSlug && n.slug !== slug);
    const sameFood = sortedNotes.filter(
      (n) => n.foodSlug === note.foodSlug && n.brandSlug !== note.brandSlug,
    );
    return [...sameBrand, ...sameFood].slice(0, limit);
  }

  return {
    getCategories,
    getCategory,
    getSubCategories,
    getSubCategory,
    getCategoriesWithBrands,
    getSubCategoriesWithBrands,
    getBrands,
    getBrand,
    getBrandsByCategory,
    getBrandsBySubCategory,
    getRelatedBrands,
    getMakers,
    getMaker,
    getBrandsByMaker,
    getRegions,
    getRegion,
    getServeStyle,
    formatServe,
    getFoods,
    getFood,
    getFoodsWithPairings,
    getBrandFoodGenres,
    getPairings,
    getServePairings,
    getPairingsByFood,
    getNotes,
    getNote,
    getNotesByBrand,
    getRelatedNotes,
  };
}
