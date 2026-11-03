import { describe, expect, it } from "vitest";
import { normalize, relevance, search, searchTerms, type SearchEntry } from "./search";

describe("normalize", () => {
  it("カタカナをひらがなにそろえる", () => {
    expect(normalize("クロキリシマ")).toBe(normalize("くろきりしま"));
  });

  it("半角カナ・全角英数を NFKC でそろえる", () => {
    expect(normalize("ｽｰﾊﾟｰ")).toBe(normalize("スーパー"));
    expect(normalize("ＡＵＮ")).toBe("aun");
  });

  it("空白・中黒・括弧を落とす", () => {
    expect(normalize("焼き鳥（タレ）")).toBe(normalize("焼き鳥タレ"));
    expect(normalize("モエ・エ・シャンドン ブリュット")).toBe(normalize("モエエシャンドンブリュット"));
  });
});

describe("search", () => {
  const entry = (title: string, text: string): SearchEntry => ({
    kind: "brand",
    title,
    detail: "",
    href: `/brands/${title}`,
    names: [normalize(title)],
    haystack: normalize(`${title} ${text}`),
  });
  const entries = [entry("a", "黒霧島 くろきりしま 宮崎"), entry("b", "久保田 千寿 新潟"), entry("c", "八海山 新潟")];

  it("空の検索語では何も返さない", () => {
    expect(search(entries, "   ")).toEqual([]);
  });

  it("空白で区切った語をすべて含むものだけ返す（AND）", () => {
    expect(search(entries, "新潟").map((e) => e.title)).toEqual(["b", "c"]);
    expect(search(entries, "新潟 千寿").map((e) => e.title)).toEqual(["b"]);
  });

  it("よみ・カタカナでも当たる", () => {
    expect(search(entries, "クロキリシマ").map((e) => e.title)).toEqual(["a"]);
  });
});

describe("関連度", () => {
  const item = (names: string[], others = "") => ({
    names: names.map(normalize),
    haystack: normalize([...names, others].join(" ")),
  });

  it("名前の完全一致 > 前方一致 > 部分一致 > ほかの欄", () => {
    const terms = searchTerms("黒霧島");
    const exact = relevance(item(["黒霧島"]), terms);
    const prefix = relevance(item(["黒霧島 25度"]), terms);
    const inName = relevance(item(["新黒霧島"]), terms);
    const elsewhere = relevance(item(["焼酎の本"], "黒霧島"), terms);
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(inName);
    expect(inName).toBeGreaterThan(elsewhere);
    expect(elsewhere).toBeGreaterThan(0);
  });

  it("よみも名前として扱う", () => {
    expect(relevance(item(["獺祭", "だっさい"]), searchTerms("だっさい"))).toBe(100);
  });

  it("どれか 1 語でも含まれなければ 0", () => {
    expect(relevance(item(["黒霧島"], "宮崎"), searchTerms("黒霧島 新潟"))).toBe(0);
  });

  it("名前に当たるものが先、同点は元の並び", () => {
    const entries: SearchEntry[] = [
      { kind: "brand", title: "スーパードライ", detail: "", href: "/a", names: [normalize("スーパードライ")], haystack: normalize("スーパードライ 焼き餃子") },
      { kind: "food", title: "焼き餃子", detail: "", href: "/b", names: [normalize("焼き餃子"), "やきぎょうざ"], haystack: normalize("焼き餃子 やきぎょうざ") },
      { kind: "brand", title: "黒ラベル", detail: "", href: "/c", names: [normalize("黒ラベル")], haystack: normalize("黒ラベル 焼き餃子") },
    ];
    expect(search(entries, "餃子").map((e) => e.title)).toEqual(["焼き餃子", "スーパードライ", "黒ラベル"]);
  });
});
