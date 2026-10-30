import type { Category, SubCategory } from "@/lib/types";

// 配列の順番がそのまま表示順
export const categories: Category[] = [
  { id: "shochu", name: "焼酎", nameEn: "SHOCHU", kana: "しょうちゅう" },
  { id: "beer", name: "ビール", nameEn: "BEER" },
  { id: "sake", name: "日本酒", nameEn: "SAKE", kana: "にほんしゅ" },
];

export const subCategories: SubCategory[] = [
  { id: "imo-shochu", categoryId: "shochu", name: "芋焼酎", kana: "いもじょうちゅう" },
  { id: "mugi-shochu", categoryId: "shochu", name: "麦焼酎", kana: "むぎじょうちゅう" },
  { id: "kome-shochu", categoryId: "shochu", name: "米焼酎", kana: "こめじょうちゅう" },
  { id: "kokuto-shochu", categoryId: "shochu", name: "黒糖焼酎", kana: "こくとうじょうちゅう" },
  { id: "korean-soju", categoryId: "shochu", name: "韓国焼酎", kana: "かんこくしょうちゅう ソジュ" },

  { id: "lager", categoryId: "beer", name: "ラガー・ピルスナー" },
  { id: "all-malt", categoryId: "beer", name: "オールモルト" },
  { id: "ale-craft", categoryId: "beer", name: "エール・クラフト" },
  { id: "dark-beer", categoryId: "beer", name: "黒ビール", kana: "くろびーる" },

  { id: "junmai-daiginjo", categoryId: "sake", name: "純米大吟醸", kana: "じゅんまいだいぎんじょう" },
  { id: "ginjo", categoryId: "sake", name: "吟醸", kana: "ぎんじょう" },
  { id: "junmai", categoryId: "sake", name: "純米", kana: "じゅんまい" },
  { id: "honjozo", categoryId: "sake", name: "本醸造", kana: "ほんじょうぞう" },
];
