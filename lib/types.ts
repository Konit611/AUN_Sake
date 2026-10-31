import type { Localized } from "./i18n/localized";

export type CategoryId = "shochu" | "beer" | "sake" | "wine";

export type Category = {
  id: CategoryId;
  name: string;
  nameEn: string;
  /** 検索用のよみ（ひらがな） */
  kana?: string;
  /** 飾り文字（焼・麦・米・葡） */
  glyph: string;
  /** 「お酒の分類」ページの説明 */
  lead: string;
  /**
   * 「お酒の分類」ページでの解説のしかた。
   * subcategories＝小分類ごとのカード（meta / taste / pair）、custom＝専用のガイド（app/categories/page.tsx の CUSTOM_GUIDES に登録）
   */
  guide: "subcategories" | "custom";
  /** 写真が入るまでのカードの色とシルエット */
  look: { tint: string; stroke: string; icon: KindIcon };
};

/** components/KindIcon.tsx のシルエット */
export type KindIcon = "bottle" | "mug" | "tokkuri" | "wine-glass";

export type SubCategory = {
  id: string;
  categoryId: CategoryId;
  name: string;
  kana?: string;
  /** 以下は「お酒の分類」ページの解説。産地・製法など */
  meta?: string;
  /** 阿：味わいの特徴 */
  taste?: string;
  /** 吽：合う料理の傾向 */
  pair?: string;
  /** まだ銘柄ページがない代表銘柄の名前（リンクなしで表示） */
  examples?: string[];
};

/** 産地。都道府県か国（日本の大手ビールのように全国区なら国） */
export type Region = {
  id: string;
  name: string;
  /** 検索用のよみ（ひらがな） */
  kana?: string;
  kind: "prefecture" | "country";
  /** 都道府県なら国の id（"jp"） */
  countryId?: string;
};

/** 蔵元・醸造所・メーカー */
export type Maker = {
  id: string;
  name: string;
  kana?: string;
  /** 所在地。銘柄の産地は、銘柄側で regionId を書かなければここ */
  regionId: string;
};

/** 飲み方のマスター（お湯割り、ロック…） */
export type ServeStyle = {
  id: string;
  name: string;
};

/** 「銘柄から探す」の「合わせたい肴」。表示名は辞書（lib/i18n）の genres */
export const FOOD_GENRES = ["seafood", "meat", "fried", "simmered", "spicy"] as const;
export type FoodGenre = (typeof FOOD_GENRES)[number];

export type Food = {
  slug: string;
  name: string;
  kana?: string;
  /** どれにも当てはまらなければ空 */
  genres: FoodGenre[];
  image?: string;
};

/** 「銘柄から探す」の「味わい」。表示名は辞書（lib/i18n）の tastes */
export const TASTE_KEYWORDS = ["clean", "crisp", "rich", "sweet", "floral", "light"] as const;
export type TasteKeyword = (typeof TASTE_KEYWORDS)[number];

/** 阿吽＝ぴたりと合う ／ 好相性＝よく合う ／ 意外＝一度試してほしい（表示名は辞書の levels） */
export type PairingLevel = "aun" | "good" | "surprise";

export const PAIRING_LEVELS: Record<PairingLevel, { order: number }> = {
  aun: { order: 0 },
  good: { order: 1 },
  surprise: { order: 2 },
};

/** 1–5 */
export type TasteChart = {
  sweetness: number;
  aroma: number;
  kire: number;
  koku: number;
};

export type BrandServe = {
  serveId: string;
  how?: string;
  note?: string;
};

/** content/brands/*.ts に書く形。pairings は銘柄の横にまとめて書く */
export type BrandInput = {
  slug: string;
  name: string;
  /** 検索用のよみ（ひらがな）。カタカナだけの名前なら不要 */
  kana?: string;
  subCategoryId: string;
  /** ほかにも載せる小分類（例：グレイス甲州 → 白ワイン ＋ 日本ワイン） */
  alsoIn?: string[];
  makerId: string;
  /** 産地が蔵元の所在地と違うときだけ書く */
  regionId?: string;
  abv?: number;
  taste: string;
  tags: string[];
  /** 絞り込み用の味わい（TASTE_KEYWORDS から） */
  tastes: TasteKeyword[];
  tasteChart?: TasteChart;
  serves: BrandServe[];
  recommendedServe: string;
  pairings: PairingInput[];
  avoid?: string;
  image?: string;
};

export type PairingInput = {
  food: string;
  level: PairingLevel;
  why: string;
  /**
   * 飲み方。あれば銘柄ページの「飲み方別、息の合う肴」に出る。
   * 同じ肴でも飲み方が違えば別のペアリングとして書ける（銘柄 × 肴 × 飲み方 で 1 つ）
   */
  serve?: string;
};

export type Brand = Omit<BrandInput, "pairings" | "regionId"> & {
  categoryId: CategoryId;
  /** 蔵元名（表示用） */
  maker: string;
  /** 産地（銘柄の regionId、なければ蔵元の所在地） */
  regionId: string;
  /** 産地名（表示用） */
  region: string;
};

export type Pairing = {
  /** 銘柄 × 肴 × 飲み方で一意。pairingId() で作る（DB に移したときの主キーの候補） */
  id: string;
  brandSlug: string;
  foodSlug: string;
  level: PairingLevel;
  why: string;
  serveId?: string;
  order: number;
};

/** 本文は content/notes/<slug>.mdx */
export type PairingNote = {
  slug: string;
  title: string;
  /** 銘柄 × 肴（× 飲み方）は登録済みのペアリングであること */
  brandSlug: string;
  foodSlug: string;
  serveId?: string;
  publishedAt: string;
  author: string;
  /** 2〜3 文の要約。銘柄ページの抜粋・一覧・meta description に使う */
  lead?: string;
  quote?: string;
  heroImage?: string;
  /** true の間はどこにも出さない（先に書いておいて、公開日に外す） */
  draft?: boolean;
};

/** 銘柄 × 肴 × 飲み方 */
export function pairingId(brandSlug: string, foodSlug: string, serveId?: string): string {
  return serveId ? `${brandSlug}/${foodSlug}@${serveId}` : `${brandSlug}/${foodSlug}`;
}

// --- content/ に書く形 ---
// 訳せる文字列は Localized（そのまま書けば日本語、{ ja, ko } で訳を足せる）。
// lib/data.ts が言語ごとに文字列へ解決するので、ページやコンポーネントは上の型（string）だけを見る。

type Translatable<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] extends string ? Localized : T[P] extends string | undefined ? Localized | undefined : T[P] extends string[] ? Localized<string[]> : never };

export type CategorySource = Translatable<Category, "name" | "lead">;
export type SubCategorySource = Translatable<SubCategory, "name" | "meta" | "taste" | "pair">;
export type ServeStyleSource = Translatable<ServeStyle, "name">;
export type RegionSource = Translatable<Region, "name">;
export type MakerSource = Translatable<Maker, "name">;
export type FoodSource = Translatable<Food, "name">;
export type BrandServeSource = Translatable<BrandServe, "how" | "note">;
export type PairingSource = Translatable<PairingInput, "why">;
export type BrandSource = Omit<Translatable<BrandInput, "name" | "taste" | "tags" | "avoid">, "serves" | "pairings"> & {
  serves: BrandServeSource[];
  pairings: PairingSource[];
};
export type PairingNoteSource = Translatable<PairingNote, "title" | "author" | "lead" | "quote">;
