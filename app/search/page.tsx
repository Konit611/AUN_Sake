import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SearchBox } from "@/components/SearchBox";
import { SectionHeading } from "@/components/ui";
import {
  getBrands,
  getBrandsByCategory,
  getBrandsBySubCategory,
  getCategoriesWithBrands,
  getCategory,
  getFood,
  getMaker,
  getRegion,
  getFoodsWithPairings,
  getPairings,
  getPairingsByFood,
  getSubCategoriesWithBrands,
  getSubCategory,
} from "@/lib/data";
import { normalize, type Searchable, type SearchEntry } from "@/lib/search";
import { defaultLocale, format, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export const metadata: Metadata = {
  ...pageMetadata({ title: t.searchPage.title, path: paths.search(locale), locale }),
  // 結果はクライアントで出すので、検索ページ自体は索引に載せない
  robots: { index: false },
};

/** 名前・よみ（関連度で重く見る）と、それ以外も含めた検索対象 */
function searchable(names: (string | undefined)[], others: (string | undefined)[] = []): Searchable {
  const n = names.filter((x): x is string => !!x).map(normalize);
  return { names: n, haystack: normalize([...n, ...others.filter(Boolean)].join(" ")) };
}

function buildIndex(): SearchEntry[] {
  const brands: SearchEntry[] = getBrands().map((b) => {
    const sub = getSubCategory(b.subCategoryId)!;
    const category = getCategory(b.categoryId)!;
    return {
      kind: "brand",
      title: b.name,
      detail: [sub.name, b.maker, b.region].join(t.common.sep),
      href: paths.brand(b.slug, locale),
      ...searchable(
        [b.name, b.kana],
        [
          b.maker,
          getMaker(b.makerId)!.kana,
          b.region,
          getRegion(b.regionId)!.kana,
          sub.name,
          sub.kana,
          category.name,
          category.kana,
          ...b.tags,
          // 肴の名前・よみでも銘柄が出るように
          ...getPairings(b.slug).flatMap((p) => {
            const food = getFood(p.foodSlug)!;
            return [food.name, food.kana];
          }),
        ],
      ),
    };
  });

  const foods: SearchEntry[] = getFoodsWithPairings().map((f) => ({
    kind: "food",
    title: f.name,
    detail: format(t.searchPage.foodDetail, { count: getPairingsByFood(f.slug).length }),
    href: paths.food(f.slug, locale),
    ...searchable([f.name, f.kana]),
  }));

  const categories: SearchEntry[] = [
    ...getCategoriesWithBrands().map((c) => ({
      kind: "category" as const,
      title: c.name,
      detail: format(t.common.brandCount, { count: getBrandsByCategory(c.id).length }),
      href: paths.category(c.id, locale),
      ...searchable([c.name, c.nameEn, c.kana]),
    })),
    ...getSubCategoriesWithBrands().map((s) => ({
      kind: "category" as const,
      title: s.name,
      detail: [
        getCategory(s.categoryId)!.name,
        format(t.common.brandCount, { count: getBrandsBySubCategory(s.id).length }),
      ].join(t.common.sep),
      href: paths.category(s.id, locale),
      ...searchable([s.name, s.kana]),
    })),
  ];

  return [...brands, ...foods, ...categories];
}

export default function SearchPage() {
  const entries = buildIndex();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        items={[{ label: t.common.home, href: paths.home(locale) }, { label: t.searchPage.title }]}
        locale={locale}
      />
      <SectionHeading as="h1" eyebrow="SEARCH" title={t.searchPage.heading} />
      {/* useSearchParams を使うので Suspense で囲む */}
      <Suspense fallback={<div className="h-14 rounded-2xl border-2 border-line-strong" />}>
        <SearchBox entries={entries} locale={locale} />
      </Suspense>
    </div>
  );
}
