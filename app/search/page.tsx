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

async function buildIndex(): Promise<SearchEntry[]> {
  const brands: SearchEntry[] = await Promise.all(
    (await getBrands(locale)).map(async (b) => {
      const sub = (await getSubCategory(b.subCategoryId, locale))!;
      const category = (await getCategory(b.categoryId, locale))!;
      // 肴の名前・よみでも銘柄が出るように
      const foods = await Promise.all(
        (await getPairings(b.slug, locale)).map(async (p) => (await getFood(p.foodSlug, locale))!),
      );
      return {
        kind: "brand" as const,
        title: b.name,
        detail: [sub.name, b.maker, b.region].join(t.common.sep),
        href: paths.brand(b.slug, locale),
        ...searchable(
          [b.name, b.kana],
          [
            b.maker,
            (await getMaker(b.makerId, locale))!.kana,
            b.region,
            (await getRegion(b.regionId, locale))!.kana,
            sub.name,
            sub.kana,
            category.name,
            category.kana,
            ...b.tags,
            ...foods.flatMap((f) => [f.name, f.kana]),
          ],
        ),
      };
    }),
  );

  const foods: SearchEntry[] = await Promise.all(
    (await getFoodsWithPairings(locale)).map(async (f) => ({
      kind: "food" as const,
      title: f.name,
      detail: format(t.searchPage.foodDetail, {
        count: (await getPairingsByFood(f.slug, locale)).length,
      }),
      href: paths.food(f.slug, locale),
      ...searchable([f.name, f.kana]),
    })),
  );

  const categories: SearchEntry[] = [
    ...(await Promise.all(
      (await getCategoriesWithBrands(locale)).map(async (c) => ({
        kind: "category" as const,
        title: c.name,
        detail: format(t.common.brandCount, {
          count: (await getBrandsByCategory(c.id, locale)).length,
        }),
        href: paths.category(c.id, locale),
        ...searchable([c.name, c.nameEn, c.kana]),
      })),
    )),
    ...(await Promise.all(
      (await getSubCategoriesWithBrands(undefined, locale)).map(async (s) => ({
        kind: "category" as const,
        title: s.name,
        detail: [
          (await getCategory(s.categoryId, locale))!.name,
          format(t.common.brandCount, { count: (await getBrandsBySubCategory(s.id, locale)).length }),
        ].join(t.common.sep),
        href: paths.category(s.id, locale),
        ...searchable([s.name, s.kana]),
      })),
    )),
  ];

  return [...brands, ...foods, ...categories];
}

export default async function SearchPage() {
  const entries = await buildIndex();

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
