import {
  pairingId,
  type BrandInput,
  type Category,
  type Food,
  type PairingNote,
  type Maker,
  type Region,
  type ServeStyle,
  type SubCategory,
  type TasteChart,
} from "./types";

type Content = {
  categories: Category[];
  subCategories: SubCategory[];
  serveStyles: ServeStyle[];
  regions: Region[];
  makers: Maker[];
  foods: Food[];
  brands: BrandInput[];
  notes: PairingNote[];
};

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dup.add(v);
    seen.add(v);
  }
  return [...dup];
}

/**
 * content/ の参照整合性を確認し、問題を文字列で返す。
 * .mdx 本文の有無はノートページのビルド（generateStaticParams）で検出される。
 */
export function validateContent(c: Content): string[] {
  const errors: string[] = [];

  const checkDup = (label: string, values: string[]) => {
    for (const d of duplicates(values)) errors.push(`${label} が重複しています: ${d}`);
  };
  checkDup("category id", c.categories.map((x) => x.id));
  checkDup("subCategory id", c.subCategories.map((x) => x.id));
  // /categories/[id] で大分類と小分類を同じ URL 空間に置いているため
  checkDup(
    "category id と subCategory id",
    [...c.categories.map((x) => x.id), ...c.subCategories.map((x) => x.id)],
  );
  checkDup("serveStyle id", c.serveStyles.map((x) => x.id));
  checkDup("region id", c.regions.map((x) => x.id));
  checkDup("maker id", c.makers.map((x) => x.id));
  checkDup("food slug", c.foods.map((x) => x.slug));
  checkDup("brand slug", c.brands.map((x) => x.slug));
  checkDup("note slug", c.notes.map((x) => x.slug));

  const categoryIds = new Set(c.categories.map((x) => x.id));
  const subCategoryIds = new Set(c.subCategories.map((x) => x.id));
  const serveIds = new Set(c.serveStyles.map((x) => x.id));
  const foodSlugs = new Set(c.foods.map((x) => x.slug));
  const brandSlugs = new Set(c.brands.map((x) => x.slug));

  const regionById = new Map(c.regions.map((r) => [r.id, r]));
  for (const r of c.regions) {
    if (r.kind === "prefecture") {
      const country = r.countryId ? regionById.get(r.countryId) : undefined;
      if (country?.kind !== "country") errors.push(`region ${r.id}: countryId "${r.countryId}" が国ではありません`);
    } else if (r.countryId) {
      errors.push(`region ${r.id}: 国に countryId は書きません`);
    }
  }
  const makerIds = new Set(c.makers.map((m) => m.id));
  for (const m of c.makers) {
    if (!regionById.has(m.regionId)) errors.push(`maker ${m.id}: regionId "${m.regionId}" がありません`);
  }

  const brandNames = new Set(c.brands.map((b) => b.name));
  for (const s of c.subCategories) {
    if (!categoryIds.has(s.categoryId)) {
      errors.push(`subCategory ${s.id}: categoryId "${s.categoryId}" がありません`);
    }
    // 銘柄を登録したら examples から消す（二重に表示されるため）
    for (const name of s.examples ?? []) {
      if (brandNames.has(name)) {
        errors.push(`subCategory ${s.id}: examples の「${name}」は登録済みの銘柄です`);
      }
    }
  }

  for (const b of c.brands) {
    const at = `brand ${b.slug}`;
    if (!subCategoryIds.has(b.subCategoryId)) {
      errors.push(`${at}: subCategoryId "${b.subCategoryId}" がありません`);
    }
    if (!makerIds.has(b.makerId)) errors.push(`${at}: makerId "${b.makerId}" がありません`);
    if (b.regionId && !regionById.has(b.regionId)) errors.push(`${at}: regionId "${b.regionId}" がありません`);
    for (const id of b.alsoIn ?? []) {
      const s = c.subCategories.find((x) => x.id === id);
      if (!s) errors.push(`${at}: alsoIn "${id}" がありません`);
      else if (id === b.subCategoryId) errors.push(`${at}: alsoIn に subCategoryId と同じ "${id}" があります`);
      else if (s.categoryId !== c.subCategories.find((x) => x.id === b.subCategoryId)?.categoryId) {
        errors.push(`${at}: alsoIn "${id}" は別の大分類です`);
      }
    }
    if (b.tastes.length === 0) errors.push(`${at}: tastes が空です`);

    const brandServes = new Set(b.serves.map((s) => s.serveId));
    for (const s of b.serves) {
      if (!serveIds.has(s.serveId)) errors.push(`${at}: serve "${s.serveId}" がありません`);
    }
    if (!brandServes.has(b.recommendedServe)) {
      errors.push(`${at}: recommendedServe "${b.recommendedServe}" が serves にありません`);
    }

    // 同じ肴でも飲み方が違えば別のペアリング
    checkDup(`${at}: pairing`, b.pairings.map((p) => pairingId(b.slug, p.food, p.serve)));
    for (const p of b.pairings) {
      if (!foodSlugs.has(p.food)) errors.push(`${at}: food "${p.food}" がありません`);
      if (p.serve && !brandServes.has(p.serve)) {
        errors.push(`${at}: pairing ${p.food} の serve "${p.serve}" が serves にありません`);
      }
    }

    if (b.tasteChart) {
      for (const [key, v] of Object.entries(b.tasteChart) as [keyof TasteChart, number][]) {
        if (!Number.isInteger(v) || v < 1 || v > 5) {
          errors.push(`${at}: tasteChart.${key} は 1–5 の整数にしてください (${v})`);
        }
      }
    }
  }

  const pairingIds = new Set(
    c.brands.flatMap((b) => b.pairings.map((p) => pairingId(b.slug, p.food, p.serve))),
  );
  // 飲み方を書かないノートは、その銘柄 × 肴のどれかのペアリングがあればよい
  const brandFoods = new Set(c.brands.flatMap((b) => b.pairings.map((p) => pairingId(b.slug, p.food))));

  for (const n of c.notes) {
    const at = `note ${n.slug}`;
    if (!brandSlugs.has(n.brandSlug)) errors.push(`${at}: brandSlug "${n.brandSlug}" がありません`);
    if (!foodSlugs.has(n.foodSlug)) errors.push(`${at}: foodSlug "${n.foodSlug}" がありません`);
    const id = pairingId(n.brandSlug, n.foodSlug, n.serveId);
    if (n.serveId ? !pairingIds.has(id) : !brandFoods.has(id)) {
      errors.push(`${at}: ペアリング ${id} が登録されていません`);
    }
    if (Number.isNaN(Date.parse(n.publishedAt))) {
      errors.push(`${at}: publishedAt "${n.publishedAt}" が日付ではありません`);
    }
  }

  return errors;
}
