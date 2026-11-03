import type { MakerSource } from "@/lib/types";

// 蔵元・醸造所・メーカー。同じよみの別の蔵（旭酒造と朝日酒造）があるので、id で区別する
export const makers: MakerSource[] = [
  // 焼酎
  { id: "kirishima-shuzo", name: "霧島酒造", kana: "きりしましゅぞう", regionId: "miyazaki" },
  { id: "shiratama-jozo", name: "白玉醸造", kana: "しらたまじょうぞう", regionId: "kagoshima" },
  { id: "sanwa-shurui", name: "三和酒類", kana: "さんわしゅるい", regionId: "oita" },
  { id: "hitejinro", name: "HITEJINRO", kana: "はいとじんろ", regionId: "kr" },
  // ビール
  { id: "asahi-beer", name: "アサヒビール", regionId: "jp" },
  { id: "sapporo-beer", name: "サッポロビール", regionId: "jp" },
  { id: "kirin-beer", name: "キリンビール", regionId: "jp" },
  { id: "yo-ho-brewing", name: "ヤッホーブルーイング", regionId: "nagano" },
  // 日本酒
  { id: "asahi-shuzo-yamaguchi", name: "旭酒造", kana: "あさひしゅぞう", regionId: "yamaguchi" },
  { id: "asahi-shuzo-niigata", name: "朝日酒造", kana: "あさひしゅぞう", regionId: "niigata" },
  { id: "hakkai-jozo", name: "八海醸造", kana: "はっかいじょうぞう", regionId: "niigata" },
  // ワイン
  { id: "chuo-budoshu", name: "中央葡萄酒", kana: "ちゅうおうぶどうしゅ", regionId: "yamanashi" },
  { id: "concha-y-toro", name: "コンチャ・イ・トロ", regionId: "cl" },
  { id: "moet-chandon", name: "モエ・エ・シャンドン", regionId: "fr" },
];
