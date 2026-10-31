/**
 * 検索用の正規化。サーバー（索引づくり）とクライアント（入力）の両方で使う。
 * - 全角英数・半角カナを NFKC でそろえる
 * - カタカナをひらがなにする（「チャミスル」と「ちゃみする」を同じに）
 * - 空白・中黒・括弧などの区切りを落とす
 */
export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・（）()「」、。]/g, "");
}

/** 空白で区切った検索語（normalize 済み） */
export function searchTerms(query: string): string[] {
  return query.split(/\s+/).map(normalize).filter(Boolean);
}

/** 検索対象。names は名前とよみ（normalize 済み）、haystack はそれ以外も含めた全部 */
export type Searchable = { names: readonly string[]; haystack: string };

// 1 語ごとの点。名前・よみに当たるほど高い
const SCORE = { exact: 100, prefix: 60, inName: 40, elsewhere: 10 } as const;

/**
 * 関連度。すべての語が haystack に含まれなければ 0。
 * 語ごとに、名前・よみとの一致（完全 > 前方 > 部分）か、それ以外の欄での一致かで点を足す
 */
export function relevance(item: Searchable, terms: readonly string[]): number {
  let total = 0;
  for (const t of terms) {
    if (!item.haystack.includes(t)) return 0;
    if (item.names.some((n) => n === t)) total += SCORE.exact;
    else if (item.names.some((n) => n.startsWith(t))) total += SCORE.prefix;
    else if (item.names.some((n) => n.includes(t))) total += SCORE.inName;
    else total += SCORE.elsewhere;
  }
  return total;
}

/** 関連度の高い順（同点は元の並び）。検索語が空なら元の並びのまま全部 */
export function rankByRelevance<T>(items: readonly T[], terms: readonly string[], of: (item: T) => Searchable): T[] {
  if (terms.length === 0) return [...items];
  return items
    .map((item, i) => ({ item, i, score: relevance(of(item), terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.item);
}

export type SearchEntry = Searchable & {
  kind: "brand" | "food" | "category";
  title: string;
  /** 結果の 2 行目 */
  detail: string;
  href: string;
};

/** 空白区切りの語をすべて含むものを、関連度の高い順に返す。検索語が空なら何も返さない */
export function search(entries: readonly SearchEntry[], query: string): SearchEntry[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];
  return rankByRelevance(entries, terms, (e) => e);
}
