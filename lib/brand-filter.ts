import { normalize } from "./search";
import { FOOD_GENRES, TASTE_KEYWORDS, type FoodGenre, type TasteKeyword } from "./types";

// 「銘柄から探す」の絞り込み。URL（?q=&kind=&taste=&food=）との相互変換と、絞り込みそのもの

export type BrandFilters = {
  q: string;
  /** "all" か大分類の id */
  kind: string;
  /** "" か TASTE_KEYWORDS のどれか */
  taste: string;
  /** "" か FOOD_GENRES のどれか */
  food: string;
};

export const EMPTY_FILTERS: BrandFilters = { q: "", kind: "all", taste: "", food: "" };

/** 知らない値は無視して既定値にする（古いリンクや手入力で 0 件のまま固まらないように） */
export function parseFilters(search: string, kindIds: readonly string[]): BrandFilters {
  const p = new URLSearchParams(search);
  const pick = (value: string | null, allowed: readonly string[], fallback: string) =>
    value !== null && allowed.includes(value) ? value : fallback;
  return {
    q: p.get("q") ?? EMPTY_FILTERS.q,
    kind: pick(p.get("kind"), ["all", ...kindIds], EMPTY_FILTERS.kind),
    taste: pick(p.get("taste"), TASTE_KEYWORDS, EMPTY_FILTERS.taste),
    food: pick(p.get("food"), FOOD_GENRES, EMPTY_FILTERS.food),
  };
}

/** 既定値の項目は書かない。すべて既定値なら "" */
export function filtersToSearch(f: BrandFilters): string {
  const qs = new URLSearchParams();
  (Object.keys(f) as (keyof BrandFilters)[]).forEach((k) => {
    if (f[k] !== EMPTY_FILTERS[k]) qs.set(k, f[k]);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export type FilterableBrand = {
  slug: string;
  kind: string;
  tastes: readonly TasteKeyword[];
  genres: readonly FoodGenre[];
};

/**
 * 条件をすべて満たす銘柄。キーワードは空白で区切った語をすべて含むもの。
 * haystackOf は normalize 済みの検索対象を返す。
 */
export function filterBrands<B extends FilterableBrand>(
  brands: readonly B[],
  f: BrandFilters,
  haystackOf: (b: B) => string,
): B[] {
  const terms = f.q.split(/\s+/).map(normalize).filter(Boolean);
  return brands.filter(
    (b) =>
      (f.kind === "all" || b.kind === f.kind) &&
      (!f.taste || b.tastes.includes(f.taste as TasteKeyword)) &&
      (!f.food || b.genres.includes(f.food as FoodGenre)) &&
      terms.every((t) => haystackOf(b).includes(t)),
  );
}
