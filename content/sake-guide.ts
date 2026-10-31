// 「お酒の分類」ページの日本酒セクション。香味の4タイプと特定名称の早見表

export type SakeType = {
  name: string;
  kana: string;
  aroma: "高い" | "穏やか";
  body: "軽快・淡麗" | "濃醇・コク";
  desc: string;
  pair: string;
};

// 並びは 2×2 の表の左上 → 右上 → 左下 → 右下
export const sakeTypes: SakeType[] = [
  {
    name: "薫酒",
    kana: "くんしゅ",
    aroma: "高い",
    body: "軽快・淡麗",
    desc: "大吟醸・吟醸など。果実や花の香り。",
    pair: "香りを邪魔しない軽い前菜、柑橘やハーブを使った料理",
  },
  {
    name: "熟酒",
    kana: "じゅくしゅ",
    aroma: "高い",
    body: "濃醇・コク",
    desc: "長期熟成酒・古酒。カラメルやスパイスの香り。",
    pair: "うなぎの蒲焼、中華の煮込み、熟成チーズ",
  },
  {
    name: "爽酒",
    kana: "そうしゅ",
    aroma: "穏やか",
    body: "軽快・淡麗",
    desc: "本醸造・生酒など。軽快でなめらか。",
    pair: "刺身、冷奴、塩焼きなど素材を生かした料理",
  },
  {
    name: "醇酒",
    kana: "じゅんしゅ",
    aroma: "穏やか",
    body: "濃醇・コク",
    desc: "純米酒・生酛など。米の旨みとコク。",
    pair: "煮物、焼き鳥（タレ）、味噌を使った料理",
  },
];

export type SakeGrade = { name: string; polish: string; alcohol: "あり" | "なし" };

export const sakeGrades: SakeGrade[] = [
  { name: "純米大吟醸", polish: "50%以下", alcohol: "なし" },
  { name: "大吟醸", polish: "50%以下", alcohol: "あり" },
  { name: "純米吟醸", polish: "60%以下", alcohol: "なし" },
  { name: "吟醸", polish: "60%以下", alcohol: "あり" },
  { name: "特別純米", polish: "60%以下 等", alcohol: "なし" },
  { name: "特別本醸造", polish: "60%以下 等", alcohol: "あり" },
  { name: "純米", polish: "規定なし", alcohol: "なし" },
  { name: "本醸造", polish: "70%以下", alcohol: "あり" },
];
