import type { RegionSource } from "@/lib/types";

// 産地。都道府県は countryId で国につなぐ。全国区の銘柄（大手ビールなど）は国を使う
export const regions: RegionSource[] = [
  // 国
  { id: "jp", name: "日本", kana: "にほん", kind: "country" },
  { id: "kr", name: "韓国", kana: "かんこく", kind: "country" },
  { id: "fr", name: "フランス", kind: "country" },
  { id: "cl", name: "チリ", kind: "country" },
  // 都道府県
  { id: "nagano", name: "長野", kana: "ながの", kind: "prefecture", countryId: "jp" },
  { id: "niigata", name: "新潟", kana: "にいがた", kind: "prefecture", countryId: "jp" },
  { id: "yamanashi", name: "山梨", kana: "やまなし", kind: "prefecture", countryId: "jp" },
  { id: "yamaguchi", name: "山口", kana: "やまぐち", kind: "prefecture", countryId: "jp" },
  { id: "oita", name: "大分", kana: "おおいた", kind: "prefecture", countryId: "jp" },
  { id: "miyazaki", name: "宮崎", kana: "みやざき", kind: "prefecture", countryId: "jp" },
  { id: "kagoshima", name: "鹿児島", kana: "かごしま", kind: "prefecture", countryId: "jp" },
];
