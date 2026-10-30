export type CategoryId = "shochu" | "beer" | "sake";

export type Category = {
  id: CategoryId;
  name: string;
  nameEn: string;
  /** 検索用のよみ（ひらがな） */
  kana?: string;
};

export type SubCategory = {
  id: string;
  categoryId: CategoryId;
  name: string;
  kana?: string;
};

/** 飲み方のマスター（お湯割り、ロック…） */
export type ServeStyle = {
  id: string;
  name: string;
};

export type Food = {
  slug: string;
  name: string;
  kana?: string;
  image?: string;
};

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
  maker: string;
  region: string;
  abv?: number;
  taste: string;
  tags: string[];
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
