import type { Food } from "@/lib/types";

// genres は「銘柄から探す」の「合わせたい肴」。銘柄の肴ジャンルはペアリングから自動で決まる
export const foods: Food[] = [
  // 焼酎
  { slug: "buta-kakuni", name: "豚の角煮", kana: "ぶたのかくに", genres: ["肉料理", "煮物"] },
  { slug: "satsuma-age", name: "さつま揚げ", kana: "さつまあげ", genres: ["揚げ物", "魚介"] },
  { slug: "jidori-sumibi", name: "地鶏の炭火焼", kana: "じどりのすみびやき", genres: ["肉料理"] },
  { slug: "toriten", name: "とり天", kana: "とりてん", genres: ["揚げ物", "肉料理"] },
  { slug: "karaage", name: "鶏の唐揚げ", kana: "とりのからあげ", genres: ["揚げ物", "肉料理"] },
  { slug: "hiyayakko", name: "冷奴（薬味たっぷり）", kana: "ひややっこ", genres: [] },
  { slug: "samgyeopsal", name: "サムギョプサル", genres: ["肉料理"] },
  { slug: "kimchi-jjigae", name: "キムチチゲ", genres: ["辛い料理"] },
  { slug: "haemul-pajeon", name: "海鮮チヂミ", kana: "かいせんちぢみ", genres: ["魚介"] },
  // ビール
  { slug: "yaki-gyoza", name: "焼き餃子", kana: "やきぎょうざ", genres: ["肉料理"] },
  { slug: "edamame", name: "枝豆", kana: "えだまめ", genres: [] },
  { slug: "yakitori-tare", name: "焼き鳥（タレ）", kana: "やきとり たれ", genres: ["肉料理"] },
  { slug: "jingisukan", name: "ジンギスカン", genres: ["肉料理"] },
  { slug: "potato-salad", name: "ポテトサラダ", genres: [] },
  { slug: "roast-beef", name: "ローストビーフ", genres: ["肉料理"] },
  { slug: "sausage", name: "粗挽きソーセージ", kana: "あらびきそーせーじ", genres: ["肉料理"] },
  { slug: "aged-cheese", name: "熟成チーズ", kana: "じゅくせいちーず", genres: [] },
  // 日本酒
  { slug: "white-fish-carpaccio", name: "白身魚のカルパッチョ", kana: "しろみざかなのかるぱっちょ", genres: ["魚介"] },
  { slug: "yuba-sashimi", name: "湯葉の刺身", kana: "ゆばのさしみ", genres: [] },
  { slug: "prosciutto-persimmon", name: "生ハムと柿", kana: "なまはむとかき", genres: [] },
  { slug: "sashimi-moriawase", name: "刺身の盛り合わせ", kana: "さしみのもりあわせ", genres: ["魚介"] },
  { slug: "yudofu", name: "湯豆腐", kana: "ゆどうふ", genres: ["煮物"] },
  { slug: "yakizakana-shio", name: "焼き魚（塩）", kana: "やきざかな しお", genres: ["魚介"] },
  { slug: "oden", name: "おでん", genres: ["煮物"] },
  { slug: "nigiri-sushi", name: "握り寿司", kana: "にぎりずし", genres: ["魚介"] },
  { slug: "shiokara", name: "塩辛", kana: "しおから", genres: ["魚介"] },
  // ワイン
  { slug: "tempura-sudachi", name: "天ぷら（塩・すだち）", kana: "てんぷら しお すだち", genres: ["揚げ物", "魚介"] },
  { slug: "white-fish-sashimi", name: "白身魚の刺身", kana: "しろみざかなのさしみ", genres: ["魚介"] },
  { slug: "chawanmushi", name: "茶碗蒸し", kana: "ちゃわんむし", genres: [] },
  { slug: "steak", name: "ステーキ", genres: ["肉料理"] },
  { slug: "sukiyaki", name: "すき焼き", kana: "すきやき", genres: ["肉料理", "煮物"] },
  { slug: "yakitori-liver", name: "焼き鳥（レバー・タレ）", kana: "やきとり ればー たれ", genres: ["肉料理"] },
  { slug: "raw-oyster", name: "生牡蠣", kana: "なまがき", genres: ["魚介"] },
  { slug: "potato-chips", name: "ポテトチップス（塩）", genres: ["揚げ物"] },
];
