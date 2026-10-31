import type { Metadata } from "next";
import { BrandExplorer, type ExplorerBrand } from "@/components/BrandExplorer";
import {
  getBrandFoodGenres,
  getBrands,
  getBrandsByCategory,
  getCategories,
  getCategory,
  getFood,
  getPairings,
  getSubCategory,
} from "@/lib/data";
import { normalize } from "@/lib/search";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "銘柄から探す",
  description: "いつも飲んでいる一本、気になっている一本から、息の合う肴を見つけましょう。",
  path: "/brands",
});

export default function BrandsPage() {
  const brands: ExplorerBrand[] = getBrands().map((b) => {
    const category = getCategory(b.categoryId)!;
    const sub = getSubCategory(b.subCategoryId)!;
    const best = getPairings(b.slug)[0];
    return {
      slug: b.slug,
      name: b.name,
      kind: category.id,
      kindName: category.name,
      sub: sub.name,
      maker: b.maker,
      region: b.region,
      tastes: b.tastes,
      genres: getBrandFoodGenres(b.slug),
      pair: best && getFood(best.foodSlug)!.name,
      haystack: normalize(
        [b.name, b.kana, b.maker, b.region, sub.name, sub.kana, category.name, category.kana]
          .filter(Boolean)
          .join(" "),
      ),
    };
  });
  const kinds = getCategories()
    .filter((c) => getBrandsByCategory(c.id).length > 0)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 pb-10 pt-7 md:gap-6 md:px-6 md:pb-20 md:pt-14">
      <div className="flex flex-col gap-1.5 px-5 md:gap-2.5 md:px-0">
        <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">BRANDS</p>
        <h1 className="text-[30px] font-black md:text-[44px]">銘柄から探す</h1>
        <p className="hidden text-base text-muted md:block">
          いつも飲んでいる一本、気になっている一本から、息の合う肴を見つけましょう。
        </p>
      </div>
      <BrandExplorer brands={brands} kinds={kinds} />
    </div>
  );
}
