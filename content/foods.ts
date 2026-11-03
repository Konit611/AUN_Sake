import type { FoodSource } from "@/lib/types";

// genres は「銘柄から探す」の「合わせたい肴」。銘柄の肴ジャンルはペアリングから自動で決まる
export const foods: FoodSource[] = [
  // 焼酎
  { slug: "buta-kakuni", name: "豚の角煮", kana: "ぶたのかくに", genres: ["meat", "simmered"] },
  { slug: "satsuma-age", name: "さつま揚げ", kana: "さつまあげ", genres: ["fried", "seafood"] },
  { slug: "jidori-sumibi", name: "地鶏の炭火焼", kana: "じどりのすみびやき", genres: ["meat"] },
  { slug: "toriten", name: "とり天", kana: "とりてん", genres: ["fried", "meat"] },
  { slug: "karaage", name: "鶏の唐揚げ", kana: "とりのからあげ", genres: ["fried", "meat"] },
  { slug: "hiyayakko", name: "冷奴（薬味たっぷり）", kana: "ひややっこ", genres: [] },
  { slug: "samgyeopsal", name: "サムギョプサル", genres: ["meat"] },
  { slug: "kimchi-jjigae", name: "キムチチゲ", genres: ["spicy"] },
  { slug: "buta-shogayaki", name: "豚の生姜焼き", kana: "ぶたのしょうがやき", genres: ["meat"] },
  { slug: "kibinago-tempura", name: "きびなごの天ぷら", kana: "きびなごのてんぷら", genres: ["fried", "seafood"] },
  { slug: "haemul-pajeon", name: "海鮮チヂミ", kana: "かいせんちぢみ", genres: ["seafood"] },
  // ビール
  { slug: "tempura-moriawase", name: "天ぷら盛り合わせ", kana: "てんぷらもりあわせ", genres: ["fried", "seafood"] },
  { slug: "spice-chicken", name: "スパイスチキン", genres: ["meat", "spicy"] },
  { slug: "yaki-gyoza", name: "焼き餃子", kana: "やきぎょうざ", genres: ["meat"] },
  { slug: "edamame", name: "枝豆", kana: "えだまめ", genres: [] },
  { slug: "yakitori-tare", name: "焼き鳥（タレ）", kana: "やきとり たれ", genres: ["meat"] },
  { slug: "jingisukan", name: "ジンギスカン", genres: ["meat"] },
  { slug: "potato-salad", name: "ポテトサラダ", genres: [] },
  { slug: "roast-beef", name: "ローストビーフ", genres: ["meat"] },
  { slug: "sausage", name: "粗挽きソーセージ", kana: "あらびきそーせーじ", genres: ["meat"] },
  { slug: "aged-cheese", name: "熟成チーズ", kana: "じゅくせいちーず", genres: [] },
  // 日本酒
  { slug: "white-fish-carpaccio", name: "白身魚のカルパッチョ", kana: "しろみざかなのかるぱっちょ", genres: ["seafood"] },
  { slug: "yuba-sashimi", name: "湯葉の刺身", kana: "ゆばのさしみ", genres: [] },
  { slug: "prosciutto-persimmon", name: "生ハムと柿", kana: "なまはむとかき", genres: [] },
  { slug: "sashimi-moriawase", name: "刺身の盛り合わせ", kana: "さしみのもりあわせ", genres: ["seafood"] },
  { slug: "yudofu", name: "湯豆腐", kana: "ゆどうふ", genres: ["simmered"] },
  { slug: "yakizakana-shio", name: "焼き魚（塩）", kana: "やきざかな しお", genres: ["seafood"] },
  { slug: "oden", name: "おでん", genres: ["simmered"] },
  { slug: "nigiri-sushi", name: "握り寿司", kana: "にぎりずし", genres: ["seafood"] },
  { slug: "shiokara", name: "塩辛", kana: "しおから", genres: ["seafood"] },
  // ワイン
  { slug: "tempura-sudachi", name: "天ぷら（塩・すだち）", kana: "てんぷら しお すだち", genres: ["fried", "seafood"] },
  { slug: "white-fish-sashimi", name: "白身魚の刺身", kana: "しろみざかなのさしみ", genres: ["seafood"] },
  { slug: "chawanmushi", name: "茶碗蒸し", kana: "ちゃわんむし", genres: [] },
  { slug: "steak", name: "ステーキ", genres: ["meat"] },
  { slug: "sukiyaki", name: "すき焼き", kana: "すきやき", genres: ["meat", "simmered"] },
  { slug: "yakitori-liver", name: "焼き鳥（レバー・タレ）", kana: "やきとり ればー たれ", genres: ["meat"] },
  { slug: "raw-oyster", name: "生牡蠣", kana: "なまがき", genres: ["seafood"] },
  { slug: "potato-chips", name: "ポテトチップス（塩）", genres: ["fried"] },
];
