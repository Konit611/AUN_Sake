import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  filterBrands,
  filtersToSearch,
  parseFilters,
  type FilterableBrand,
} from "./brand-filter";
import { normalize } from "./search";

const kinds = ["shochu", "beer", "wine"];

describe("parseFilters", () => {
  it("クエリがなければ既定値", () => {
    expect(parseFilters("", kinds)).toEqual(EMPTY_FILTERS);
  });

  it("正しい値はそのまま読む", () => {
    expect(parseFilters("?q=新潟&kind=beer&taste=crisp&food=fried", kinds)).toEqual({
      q: "新潟",
      kind: "beer",
      taste: "crisp",
      food: "fried",
    });
  });

  it("知らない値は既定値に戻す", () => {
    expect(parseFilters("?kind=whisky&taste=spicy-ish&food=dessert", kinds)).toEqual(EMPTY_FILTERS);
  });
});

describe("filtersToSearch", () => {
  it("既定値は書かない", () => {
    expect(filtersToSearch(EMPTY_FILTERS)).toBe("");
    expect(filtersToSearch({ ...EMPTY_FILTERS, kind: "wine" })).toBe("?kind=wine");
  });

  it("parseFilters と往復できる", () => {
    const f = { q: "黒 霧島", kind: "shochu", taste: "sweet", food: "meat" };
    expect(parseFilters(filtersToSearch(f), kinds)).toEqual(f);
  });
});

describe("filterBrands", () => {
  type B = FilterableBrand & { text: string };
  const brands: B[] = [
    { slug: "kuro", kind: "shochu", tastes: ["sweet", "crisp"], genres: ["meat", "fried"], text: "黒霧島 宮崎" },
    { slug: "dry", kind: "beer", tastes: ["crisp", "clean"], genres: ["fried"], text: "スーパードライ" },
    { slug: "grace", kind: "wine", tastes: ["clean"], genres: ["seafood"], text: "グレイス甲州 山梨" },
  ];
  const run = (patch: Partial<typeof EMPTY_FILTERS>) =>
    filterBrands(brands, { ...EMPTY_FILTERS, ...patch }, (b) => ({
      names: [normalize(b.text.split(" ")[0])],
      haystack: normalize(b.text),
    })).map((b) => b.slug);

  it("条件なしなら全件", () => {
    expect(run({})).toEqual(["kuro", "dry", "grace"]);
  });

  it("種類・味わい・肴はすべて満たすものだけ", () => {
    expect(run({ taste: "crisp" })).toEqual(["kuro", "dry"]);
    expect(run({ taste: "crisp", food: "meat" })).toEqual(["kuro"]);
    expect(run({ kind: "beer", food: "seafood" })).toEqual([]);
  });

  it("キーワードがあれば名前に当たる銘柄が先、なければ元の並び", () => {
    // 先頭の語が名前、残りは産地など
    const list: B[] = [
      { slug: "kuro", kind: "shochu", tastes: [], genres: [], text: "黒霧島 宮崎" },
      { slug: "miyazaki", kind: "beer", tastes: [], genres: [], text: "宮崎ひでじビール 宮崎" },
      { slug: "hyuga", kind: "shochu", tastes: [], genres: [], text: "日向 宮崎" },
    ];
    const rank = (q: string) =>
      filterBrands(list, { ...EMPTY_FILTERS, q }, (b) => ({
        names: [normalize(b.text.split(" ")[0])],
        haystack: normalize(b.text),
      })).map((b) => b.slug);
    expect(rank("宮崎")).toEqual(["miyazaki", "kuro", "hyuga"]);
    expect(rank("")).toEqual(["kuro", "miyazaki", "hyuga"]);
  });

  it("キーワードはカタカナ・ひらがなの違いを無視する", () => {
    expect(run({ q: "すーぱー" })).toEqual(["dry"]);
  });
});
