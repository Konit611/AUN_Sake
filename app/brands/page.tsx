import type { Metadata } from "next";
import { BrandExplorer, type ExplorerBrand, type ExplorerKind } from "@/components/BrandExplorer";
import {
  getBrandFoodGenres,
  getBrands,
  getCategoriesWithBrands,
  getFood,
  getPairings,
  getSubCategory,
} from "@/lib/data";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export const metadata: Metadata = pageMetadata({
  title: t.brandsPage.title,
  description: t.brandsPage.description,
  path: paths.brands(locale),
  locale,
});

export default function BrandsPage() {
  const brands: ExplorerBrand[] = getBrands().map((b) => {
    const sub = getSubCategory(b.subCategoryId)!;
    const best = getPairings(b.slug)[0];
    return {
      slug: b.slug,
      name: b.name,
      kana: b.kana,
      kind: b.categoryId,
      sub: sub.name,
      subKana: sub.kana,
      maker: b.maker,
      region: b.region,
      tastes: b.tastes,
      genres: getBrandFoodGenres(b.slug),
      pair: best && getFood(best.foodSlug)!.name,
    };
  });
  const kinds: ExplorerKind[] = getCategoriesWithBrands().map((c) => ({
    id: c.id,
    name: c.name,
    kana: c.kana,
    look: c.look,
  }));

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 pb-10 pt-7 md:gap-6 md:px-6 md:pb-20 md:pt-14">
      <div className="flex flex-col gap-1.5 px-5 md:gap-2.5 md:px-0">
        <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">BRANDS</p>
        <h1 className="text-[30px] font-black md:text-[44px]">{t.brandsPage.title}</h1>
        <p className="hidden text-base text-muted md:block">
          {t.brandsPage.description}
        </p>
      </div>
      <BrandExplorer brands={brands} kinds={kinds} locale={locale} />
    </div>
  );
}
