import type { Category, SubCategory } from "@/lib/types";

// 配列の順番がそのまま表示順
export const categories: Category[] = [
  { id: "shochu", name: "焼酎", nameEn: "SHOCHU" },
  { id: "beer", name: "ビール", nameEn: "BEER" },
  { id: "sake", name: "日本酒", nameEn: "SAKE" },
];

export const subCategories: SubCategory[] = [
  { id: "imo-shochu", categoryId: "shochu", name: "芋焼酎" },
  { id: "mugi-shochu", categoryId: "shochu", name: "麦焼酎" },
  { id: "kome-shochu", categoryId: "shochu", name: "米焼酎" },
  { id: "kokuto-shochu", categoryId: "shochu", name: "黒糖焼酎" },
  { id: "korean-soju", categoryId: "shochu", name: "韓国焼酎" },

  { id: "lager", categoryId: "beer", name: "ラガー・ピルスナー" },
  { id: "all-malt", categoryId: "beer", name: "オールモルト" },
  { id: "ale-craft", categoryId: "beer", name: "エール・クラフト" },
  { id: "dark-beer", categoryId: "beer", name: "黒ビール" },

  { id: "junmai-daiginjo", categoryId: "sake", name: "純米大吟醸" },
  { id: "ginjo", categoryId: "sake", name: "吟醸" },
  { id: "junmai", categoryId: "sake", name: "純米" },
  { id: "honjozo", categoryId: "sake", name: "本醸造" },
];
