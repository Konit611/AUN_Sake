import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// lib/data.ts は読み込み時に content/ を検証し、問題があれば throw する
import {
  getBrand,
  getBrands,
  getBrandsByMaker,
  getBrandsBySubCategory,
  getMaker,
  getRegion,
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
  it("検証を通る（通らなければ lib/data.ts の import で落ちる）", async () => {
    expect((await getBrands()).length).toBeGreaterThan(0);
  });

  it("どのノートにも本文の .mdx がある", async () => {
    for (const n of await getNotes()) {
      expect(existsSync(join(process.cwd(), "content/notes", `${n.slug}.mdx`)), n.slug).toBe(true);
    }
  });

  it("どの銘柄にもペアリングが 1 つ以上ある（ページと「吽」カードが空にならない）", async () => {
    for (const b of await getBrands()) {
      expect((await getPairings(b.slug)).length, b.slug).toBeGreaterThan(0);
    }
  });

  it("銘柄の蔵元・産地がつながっている（産地を書かなければ蔵元の所在地）", async () => {
    for (const b of await getBrands()) {
      const maker = await getMaker(b.makerId);
      expect(maker, b.slug).toBeDefined();
      expect((await getBrandsByMaker(b.makerId)).map((x) => x.slug)).toContain(b.slug);
      expect(b.maker).toBe(maker!.name);
      expect(b.region).toBe((await getRegion(b.regionId))!.name);
    }
  });

  it("ペアリングの id は重ならない", async () => {
    const ids = (await Promise.all((await getBrands()).map((b) => getPairings(b.slug))))
      .flat()
      .map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("関連ノートに自分は入らない", async () => {
    for (const n of await getNotes()) {
      expect((await getRelatedNotes(n.slug)).map((x) => x.slug)).not.toContain(n.slug);
    }
  });

  it("ノートは新しい順", async () => {
    const dates = (await getNotes()).map((n) => n.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("lib/data.ts の索引", () => {
  it("ペアリングは 阿吽 → 好相性 → 意外 の順", async () => {
    for (const b of await getBrands()) {
      const order = (await getPairings(b.slug)).map((p) => PAIRING_LEVELS[p.level].order);
      expect(order, b.slug).toEqual([...order].sort((x, y) => x - y));
    }
  });

  it("alsoIn の銘柄は追加の小分類にも出る", async () => {
    for (const b of await getBrands()) {
      for (const id of b.alsoIn ?? []) {
        expect((await getBrandsBySubCategory(id)).map((x) => x.slug), `${b.slug} → ${id}`).toContain(b.slug);
      }
    }
  });

  it("「ほかの○○」に自分自身は入らない", async () => {
    for (const b of await getBrands()) {
      expect((await getRelatedBrands(b.slug)).map((x) => x.slug)).not.toContain(b.slug);
    }
  });

  it("〜WithBrands / 〜WithPairings は空のものを含まない", async () => {
    const brands = await getBrands();
    for (const c of await getCategoriesWithBrands()) {
      expect(brands.some((b) => b.categoryId === c.id)).toBe(true);
    }
    for (const s of await getSubCategoriesWithBrands()) {
      expect((await getBrandsBySubCategory(s.id)).length).toBeGreaterThan(0);
    }
    for (const f of await getFoodsWithPairings()) {
      expect((await getPairingsByFood(f.slug)).length).toBeGreaterThan(0);
    }
  });

  it("肴 → 銘柄の逆引きは、銘柄 → 肴と一致する", async () => {
    for (const f of await getFoodsWithPairings()) {
      for (const p of await getPairingsByFood(f.slug)) {
        expect((await getPairings(p.brandSlug)).some((x) => x.foodSlug === f.slug)).toBe(true);
        expect(await getBrand(p.brandSlug)).toBeDefined();
      }
    }
  });
});
