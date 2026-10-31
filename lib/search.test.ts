import { describe, expect, it } from "vitest";
import { normalize, search, type SearchEntry } from "./search";

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
    haystack: normalize(text),
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
