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
    expect(parseFilters("?q=新潟&kind=beer&taste=キレ&food=揚げ物", kinds)).toEqual({
      q: "新潟",
      kind: "beer",
      taste: "キレ",
      food: "揚げ物",
    });
  });

  it("知らない値は既定値に戻す", () => {
    expect(parseFilters("?kind=whisky&taste=辛い&food=デザート", kinds)).toEqual(EMPTY_FILTERS);
  });
});

describe("filtersToSearch", () => {
  it("既定値は書かない", () => {
    expect(filtersToSearch(EMPTY_FILTERS)).toBe("");
    expect(filtersToSearch({ ...EMPTY_FILTERS, kind: "wine" })).toBe("?kind=wine");
  });

  it("parseFilters と往復できる", () => {
    const f = { q: "黒 霧島", kind: "shochu", taste: "甘み", food: "肉料理" };
    expect(parseFilters(filtersToSearch(f), kinds)).toEqual(f);
  });
});

describe("filterBrands", () => {
  type B = FilterableBrand & { text: string };
  const brands: B[] = [
    { slug: "kuro", kind: "shochu", tastes: ["甘み", "キレ"], genres: ["肉料理", "揚げ物"], text: "黒霧島 宮崎" },
    { slug: "dry", kind: "beer", tastes: ["キレ", "すっきり"], genres: ["揚げ物"], text: "スーパードライ" },
    { slug: "grace", kind: "wine", tastes: ["すっきり"], genres: ["魚介"], text: "グレイス甲州 山梨" },
  ];
  const run = (patch: Partial<typeof EMPTY_FILTERS>) =>
    filterBrands(brands, { ...EMPTY_FILTERS, ...patch }, (b) => normalize(b.text)).map((b) => b.slug);

  it("条件なしなら全件", () => {
    expect(run({})).toEqual(["kuro", "dry", "grace"]);
  });

  it("種類・味わい・肴はすべて満たすものだけ", () => {
    expect(run({ taste: "キレ" })).toEqual(["kuro", "dry"]);
    expect(run({ taste: "キレ", food: "肉料理" })).toEqual(["kuro"]);
    expect(run({ kind: "beer", food: "魚介" })).toEqual([]);
  });

  it("キーワードはカタカナ・ひらがなの違いを無視する", () => {
    expect(run({ q: "すーぱー" })).toEqual(["dry"]);
  });
});
