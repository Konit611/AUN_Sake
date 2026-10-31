import { describe, expect, it } from "vitest";
import type { BrandInput, Category, Food, PairingNote, ServeStyle, SubCategory } from "./types";
import { validateContent } from "./validate";

// 最小限の正しいデータ。各テストで一部だけ壊して、狙ったエラーが出ることを確かめる
function fixture() {
  const look = { tint: "#000", stroke: "#fff", icon: "bottle" } as const;
  const categories: Category[] = [
    { id: "shochu", name: "焼酎", nameEn: "SHOCHU", glyph: "焼", lead: "", guide: "subcategories", look },
    { id: "wine", name: "ワイン", nameEn: "WINE", glyph: "葡", lead: "", guide: "subcategories", look },
  ];
  const subCategories: SubCategory[] = [
    { id: "imo", categoryId: "shochu", name: "芋焼酎", examples: ["魔王"] },
    { id: "white", categoryId: "wine", name: "白ワイン" },
    { id: "japan", categoryId: "wine", name: "日本ワイン" },
  ];
  const serveStyles: ServeStyle[] = [
    { id: "rock", name: "ロック" },
    { id: "oyuwari", name: "お湯割り" },
  ];
  const foods: Food[] = [
    { slug: "kakuni", name: "豚の角煮", genres: ["meat"] },
    { slug: "tempura", name: "天ぷら", genres: ["fried"] },
  ];
  const brands: BrandInput[] = [
    {
      slug: "kuro",
      name: "黒霧島",
      subCategoryId: "imo",
      maker: "霧島酒造",
      region: "宮崎",
      taste: "",
      tags: [],
      tastes: ["sweet"],
      tasteChart: { sweetness: 4, aroma: 3, kire: 4, koku: 3 },
      serves: [{ serveId: "oyuwari" }, { serveId: "rock" }],
      recommendedServe: "oyuwari",
      pairings: [{ food: "kakuni", level: "aun", serve: "oyuwari", why: "" }],
    },
    {
      slug: "grace",
      name: "グレイス甲州",
      subCategoryId: "white",
      alsoIn: ["japan"],
      maker: "中央葡萄酒",
      region: "山梨",
      taste: "",
      tags: [],
      tastes: ["clean"],
      serves: [{ serveId: "rock" }],
      recommendedServe: "rock",
      pairings: [{ food: "tempura", level: "aun", why: "" }],
    },
  ];
  const notes: PairingNote[] = [
    {
      slug: "kuro-kakuni",
      title: "",
      brandSlug: "kuro",
      foodSlug: "kakuni",
      publishedAt: "2026-10-30",
      author: "",
    },
  ];
  return { categories, subCategories, serveStyles, foods, brands, notes };
}

describe("validateContent", () => {
  it("正しいデータならエラーなし", () => {
    expect(validateContent(fixture())).toEqual([]);
  });

  it("slug の重複", () => {
    const c = fixture();
    c.foods.push({ ...c.foods[0] });
    expect(validateContent(c)).toContain("food slug が重複しています: kakuni");
  });

  it("大分類と小分類の id が重なる（/categories/[id] を共有しているため）", () => {
    const c = fixture();
    c.subCategories.push({ id: "wine", categoryId: "wine", name: "x" });
    expect(validateContent(c)).toContain("category id と subCategory id が重複しています: wine");
  });

  it("存在しない肴・飲み方・小分類を参照している", () => {
    const c = fixture();
    c.brands[0].pairings.push({ food: "nope", level: "good", why: "" });
    c.brands[0].recommendedServe = "mizuwari";
    c.brands[1].subCategoryId = "red";
    const errors = validateContent(c);
    expect(errors).toContain('brand kuro: food "nope" がありません');
    expect(errors).toContain('brand kuro: recommendedServe "mizuwari" が serves にありません');
    expect(errors).toContain('brand grace: subCategoryId "red" がありません');
  });

  it("ペアリングの飲み方が、その銘柄の serves にない", () => {
    const c = fixture();
    c.brands[1].pairings[0].serve = "oyuwari";
    expect(validateContent(c)).toContain(
      'brand grace: pairing tempura の serve "oyuwari" が serves にありません',
    );
  });

  it("同じ銘柄 × 肴 × 飲み方のペアリングは 1 つまで", () => {
    const c = fixture();
    c.brands[0].pairings.push({ food: "kakuni", level: "good", serve: "oyuwari", why: "" });
    expect(validateContent(c)).toContain("brand kuro: pairing が重複しています: kuro/kakuni@oyuwari");
  });

  it("同じ肴でも飲み方が違えば別のペアリングとして書ける", () => {
    const c = fixture();
    c.brands[0].pairings.push({ food: "kakuni", level: "good", serve: "rock", why: "" });
    expect(validateContent(c)).toEqual([]);
  });

  it("ノートは登録済みのペアリングについて書く", () => {
    const c = fixture();
    c.notes.push({ ...c.notes[0], slug: "kuro-tempura", foodSlug: "tempura" });
    c.notes.push({ ...c.notes[0], slug: "kuro-kakuni-rock", serveId: "rock" });
    const errors = validateContent(c);
    expect(errors).toContain("note kuro-tempura: ペアリング kuro/tempura が登録されていません");
    expect(errors).toContain("note kuro-kakuni-rock: ペアリング kuro/kakuni@rock が登録されていません");
  });

  it("飲み方を書かないノートは、その銘柄 × 肴のどの飲み方でもよい", () => {
    const c = fixture();
    expect(c.notes[0].serveId).toBeUndefined();
    expect(validateContent(c)).toEqual([]);
  });

  it("alsoIn は同じ大分類の、別の小分類だけ", () => {
    const c = fixture();
    c.brands[1].alsoIn = ["white", "imo", "nope"];
    const errors = validateContent(c);
    expect(errors).toContain('brand grace: alsoIn に subCategoryId と同じ "white" があります');
    expect(errors).toContain('brand grace: alsoIn "imo" は別の大分類です');
    expect(errors).toContain('brand grace: alsoIn "nope" がありません');
  });

  it("tastes が空", () => {
    const c = fixture();
    c.brands[0].tastes = [];
    expect(validateContent(c)).toContain("brand kuro: tastes が空です");
  });

  it("味わいチャートは 1–5 の整数", () => {
    const c = fixture();
    c.brands[0].tasteChart = { sweetness: 0, aroma: 3.5, kire: 4, koku: 6 };
    const errors = validateContent(c);
    expect(errors.filter((e) => e.includes("tasteChart"))).toHaveLength(3);
  });

  it("examples に登録済みの銘柄名が残っている", () => {
    const c = fixture();
    c.subCategories[0].examples = ["黒霧島", "魔王"];
    expect(validateContent(c)).toContain("subCategory imo: examples の「黒霧島」は登録済みの銘柄です");
  });

  it("ノートの参照先と日付", () => {
    const c = fixture();
    c.notes[0] = { ...c.notes[0], brandSlug: "nope", publishedAt: "そのうち" };
    const errors = validateContent(c);
    expect(errors).toContain('note kuro-kakuni: brandSlug "nope" がありません');
    expect(errors).toContain('note kuro-kakuni: publishedAt "そのうち" が日付ではありません');
  });
});
