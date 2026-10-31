import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { PairingBadge, SectionHeading } from "@/components/ui";
import {
  getBrandsByCategory,
  getBrandsBySubCategory,
  getCategories,
  getCategory,
  getFood,
  getPairings,
  getSubCategories,
  getSubCategory,
} from "@/lib/data";
import { pageMetadata } from "@/lib/site";
import type { Brand, Category, CategoryId, SubCategory } from "@/lib/types";

// /categories/shochu（大分類）と /categories/imo-shochu（小分類）を同じルートで扱う。
// id が重ならないことは lib/validate.ts で確認している。
type View =
  | { kind: "category"; category: Category; brands: Brand[] }
  | { kind: "sub"; category: Category; sub: SubCategory; brands: Brand[] };

function resolve(id: string): View | undefined {
  const category = getCategory(id);
  if (category) {
    const brands = getBrandsByCategory(category.id);
    return brands.length > 0 ? { kind: "category", category, brands } : undefined;
  }
  const sub = getSubCategory(id);
  if (sub) {
    const brands = getBrandsBySubCategory(sub.id);
    if (brands.length === 0) return undefined;
    return { kind: "sub", category: getCategory(sub.categoryId)!, sub, brands };
  }
}

// 銘柄が登録されている小分類だけページを作る
function subCategoriesWithBrands(categoryId?: CategoryId) {
  return getSubCategories(categoryId).filter((s) => getBrandsBySubCategory(s.id).length > 0);
}

export function generateStaticParams() {
  return [
    ...getCategories().filter((c) => getBrandsByCategory(c.id).length > 0),
    ...subCategoriesWithBrands(),
  ].map((x) => ({ id: x.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[id]">): Promise<Metadata> {
  const { id } = await params;
  const view = resolve(id);
  if (!view) return {};
  const name = view.kind === "sub" ? view.sub.name : view.category.name;
  return pageMetadata({
    title: name,
    description: `${name}の銘柄と、息の合う肴。`,
    path: `/categories/${id}`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/categories/[id]">) {
  const { id } = await params;
  const view = resolve(id);
  if (!view) notFound();

  const { category, brands } = view;
  const subs = subCategoriesWithBrands(category.id);
  const crumbs: Crumb[] = [
    { label: "ホーム", href: "/" },
    { label: "お酒の分類", href: "/categories" },
    { label: category.name, href: `/categories/${category.id}` },
    ...(view.kind === "sub" ? [{ label: view.sub.name }] : []),
  ];
  const tabs = [
    { id: category.id, name: "すべて" },
    ...subs.map((s) => ({ id: s.id, name: s.name })),
  ];

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs items={crumbs} />

      <div className="flex flex-col gap-3">
        <SectionHeading
          as="h1"
          eyebrow={category.nameEn}
          title={view.kind === "sub" ? view.sub.name : category.name}
        />
        <p className="text-sm text-muted md:text-[15px]">{brands.length}銘柄</p>
      </div>

      {subs.length > 1 && (
        <nav aria-label={`${category.name}の分類`} className="-mx-5 md:mx-0">
          <ul className="flex gap-2 overflow-x-auto px-5 pb-1 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
            {tabs.map((t) => {
              const on = t.id === id;
              return (
                <li key={t.id} className="flex-none">
                  <Link
                    href={`/categories/${t.id}`}
                    aria-current={on ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-full border-2 px-5 text-[15px] whitespace-nowrap md:text-base ${
                      on
                        ? "border-accent bg-accent font-bold text-bg"
                        : "border-line-strong font-medium text-fg hover:border-subtle"
                    }`}
                  >
                    {t.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] md:gap-5">
        {brands.map((b) => {
          const top = getPairings(b.slug)[0];
          return (
            <li key={b.slug}>
              <Link
                href={`/brands/${b.slug}`}
                className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5 text-fg hover:border-line-strong md:rounded-[20px] md:p-[26px]"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-[22px] font-black md:text-[26px]">{b.name}</p>
                  <p className="text-[13px] text-muted md:text-sm">
                    {view.kind === "category" && `${getSubCategory(b.subCategoryId)!.name} ・ `}
                    {b.maker} ・ {b.region}
                  </p>
                </div>
                <p className="text-[15px] leading-[1.8] text-fg-2">{b.taste}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {b.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line-strong px-2.5 py-1 text-xs text-fg-2 md:text-[13px]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                {top && (
                  <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3">
                    <PairingBadge level={top.level} />
                    <span className="text-base font-bold">{getFood(top.foodSlug)!.name}</span>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
