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

export type SearchEntry = {
  kind: "brand" | "food" | "category";
  title: string;
  /** 結果の 2 行目 */
  detail: string;
  href: string;
  /** normalize 済みの検索対象 */
  haystack: string;
};

/** 空白区切りの語をすべて含むものを返す */
export function search(entries: SearchEntry[], query: string): SearchEntry[] {
  const terms = query.split(/\s+/).map(normalize).filter(Boolean);
  if (terms.length === 0) return [];
  return entries.filter((e) => terms.every((t) => e.haystack.includes(t)));
}
