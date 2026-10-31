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
};

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

/** 飲み方のマスター（お湯割り、ロック…） */
export type ServeStyle = {
  id: string;
  name: string;
};

/** 「銘柄から探す」の「合わせたい肴」 */
export const FOOD_GENRES = ["魚介", "肉料理", "揚げ物", "煮物", "辛い料理"] as const;
export type FoodGenre = (typeof FOOD_GENRES)[number];

export type Food = {
  slug: string;
  name: string;
  kana?: string;
  /** どれにも当てはまらなければ空 */
  genres: FoodGenre[];
  image?: string;
};

/** 「銘柄から探す」の「味わい」 */
export const TASTE_KEYWORDS = ["すっきり", "キレ", "コク", "甘み", "華やか", "軽快"] as const;
export type TasteKeyword = (typeof TASTE_KEYWORDS)[number];

/** 阿吽＝ぴたりと合う ／ 好相性＝よく合う ／ 意外＝一度試してほしい */
export type PairingLevel = "aun" | "good" | "surprise";

export const PAIRING_LEVELS: Record<PairingLevel, { label: string; order: number }> = {
  aun: { label: "阿吽", order: 0 },
  good: { label: "好相性", order: 1 },
  surprise: { label: "意外", order: 2 },
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
  maker: string;
  region: string;
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
  /** あれば銘柄ページの「飲み方別、息の合う肴」に出る */
  serve?: string;
};

export type Brand = Omit<BrandInput, "pairings"> & {
  categoryId: CategoryId;
};

export type Pairing = {
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
  brandSlug: string;
  foodSlug: string;
  publishedAt: string;
  author: string;
  quote?: string;
  heroImage?: string;
};
