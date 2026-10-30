import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SearchBox } from "@/components/SearchBox";
import { SectionHeading } from "@/components/ui";
import {
  getBrands,
  getBrandsByCategory,
  getBrandsBySubCategory,
  getCategories,
  getCategory,
  getFood,
  getFoods,
  getPairings,
  getPairingsByFood,
  getSubCategories,
  getSubCategory,
} from "@/lib/data";
import { normalize, type SearchEntry } from "@/lib/search";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({ title: "検索", path: "/search" }),
  // 結果はクライアントで出すので、検索ページ自体は索引に載せない
  robots: { index: false },
};

function haystack(...parts: (string | undefined)[]): string {
  return normalize(parts.filter(Boolean).join(" "));
}

function buildIndex(): SearchEntry[] {
  const brands: SearchEntry[] = getBrands().map((b) => {
    const sub = getSubCategory(b.subCategoryId)!;
    return {
      kind: "brand",
      title: b.name,
      detail: `${sub.name} ・ ${b.maker} ・ ${b.region}`,
      href: `/brands/${b.slug}`,
      haystack: haystack(
        b.name,
        b.kana,
        b.maker,
        b.region,
        sub.name,
        sub.kana,
        getCategory(b.categoryId)!.name,
        getCategory(b.categoryId)!.kana,
        ...b.tags,
        // 肴の名前・よみでも銘柄が出るように
        ...getPairings(b.slug).flatMap((p) => {
          const food = getFood(p.foodSlug)!;
          return [food.name, food.kana];
        }),
      ),
    };
  });

  const foods: SearchEntry[] = getFoods()
    .map((f) => ({ f, count: getPairingsByFood(f.slug).length }))
    .filter(({ count }) => count > 0)
    .map(({ f, count }) => ({
      kind: "food",
      title: f.name,
      detail: `息の合うお酒 ${count}銘柄`,
      href: `/foods/${f.slug}`,
      haystack: haystack(f.name, f.kana),
    }));

  const categories: SearchEntry[] = [
    ...getCategories()
      .filter((c) => getBrandsByCategory(c.id).length > 0)
      .map((c) => ({
        kind: "category" as const,
        title: c.name,
        detail: `${getBrandsByCategory(c.id).length}銘柄`,
        href: `/categories/${c.id}`,
        haystack: haystack(c.name, c.nameEn, c.kana),
      })),
    ...getSubCategories()
      .filter((s) => getBrandsBySubCategory(s.id).length > 0)
      .map((s) => ({
        kind: "category" as const,
        title: s.name,
        detail: `${getCategory(s.categoryId)!.name} ・ ${getBrandsBySubCategory(s.id).length}銘柄`,
        href: `/categories/${s.id}`,
        haystack: haystack(s.name, s.kana),
      })),
  ];

  return [...brands, ...foods, ...categories];
}

export default function SearchPage() {
  const entries = buildIndex();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs items={[{ label: "ホーム", href: "/" }, { label: "検索" }]} />
      <SectionHeading as="h1" eyebrow="SEARCH" title="銘柄・肴・分類を探す" />
      {/* useSearchParams を使うので Suspense で囲む */}
      <Suspense fallback={<div className="h-14 rounded-2xl border-2 border-line-strong" />}>
        <SearchBox entries={entries} />
      </Suspense>
    </div>
  );
}
