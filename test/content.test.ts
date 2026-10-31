import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// lib/data.ts は読み込み時に content/ を検証し、問題があれば throw する
import {
  getBrand,
  getBrands,
  getBrandsBySubCategory,
  getCategoriesWithBrands,
  getFoodsWithPairings,
  getNotes,
  getPairings,
  getPairingsByFood,
  getRelatedBrands,
  getRelatedNotes,
  getSubCategoriesWithBrands,
} from "@/lib/data";
import { PAIRING_LEVELS } from "@/lib/types";

// 実際の content/ に対するテスト。データの中身ではなく、決まりごとが守られているかを見る

describe("content/", () => {
  it("検証を通る（通らなければ lib/data.ts の import で落ちる）", () => {
    expect(getBrands().length).toBeGreaterThan(0);
  });

  it("どのノートにも本文の .mdx がある", () => {
    for (const n of getNotes()) {
      expect(existsSync(join(process.cwd(), "content/notes", `${n.slug}.mdx`)), n.slug).toBe(true);
    }
  });

  it("どの銘柄にもペアリングが 1 つ以上ある（ページと「吽」カードが空にならない）", () => {
    for (const b of getBrands()) {
      expect(getPairings(b.slug).length, b.slug).toBeGreaterThan(0);
    }
  });

  it("ペアリングの id は重ならない", () => {
    const ids = getBrands().flatMap((b) => getPairings(b.slug).map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("関連ノートに自分は入らない", () => {
    for (const n of getNotes()) {
      expect(getRelatedNotes(n.slug).map((x) => x.slug)).not.toContain(n.slug);
    }
  });

  it("ノートは新しい順", () => {
    const dates = getNotes().map((n) => n.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("lib/data.ts の索引", () => {
  it("ペアリングは 阿吽 → 好相性 → 意外 の順", () => {
    for (const b of getBrands()) {
      const order = getPairings(b.slug).map((p) => PAIRING_LEVELS[p.level].order);
      expect(order, b.slug).toEqual([...order].sort((x, y) => x - y));
    }
  });

  it("alsoIn の銘柄は追加の小分類にも出る", () => {
    for (const b of getBrands()) {
      for (const id of b.alsoIn ?? []) {
        expect(getBrandsBySubCategory(id).map((x) => x.slug), `${b.slug} → ${id}`).toContain(b.slug);
      }
    }
  });

  it("「ほかの○○」に自分自身は入らない", () => {
    for (const b of getBrands()) {
      expect(getRelatedBrands(b.slug).map((x) => x.slug)).not.toContain(b.slug);
    }
  });

  it("〜WithBrands / 〜WithPairings は空のものを含まない", () => {
    for (const c of getCategoriesWithBrands()) expect(getBrands().some((b) => b.categoryId === c.id)).toBe(true);
    for (const s of getSubCategoriesWithBrands()) expect(getBrandsBySubCategory(s.id).length).toBeGreaterThan(0);
    for (const f of getFoodsWithPairings()) expect(getPairingsByFood(f.slug).length).toBeGreaterThan(0);
  });

  it("肴 → 銘柄の逆引きは、銘柄 → 肴と一致する", () => {
    for (const f of getFoodsWithPairings()) {
      for (const p of getPairingsByFood(f.slug)) {
        expect(getPairings(p.brandSlug).some((x) => x.foodSlug === f.slug)).toBe(true);
        expect(getBrand(p.brandSlug)).toBeDefined();
      }
    }
  });
});
