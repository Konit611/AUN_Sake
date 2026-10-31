import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShowMore } from "@/components/ShowMore";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { BrandCard, brandGridClass } from "@/components/BrandCard";
import { chipClass, SectionHeading } from "@/components/ui";
import {
  getBrandsByCategory,
  getBrandsBySubCategory,
  getCategoriesWithBrands,
  getCategory,
  getFood,
  getPairings,
  getSubCategoriesWithBrands,
  getSubCategory,
} from "@/lib/data";
import { pageMetadata } from "@/lib/site";
import type { Brand, Category, SubCategory } from "@/lib/types";

// /categories/shochu（大分類）と /categories/imo-shochu（小分類）を同じルートで扱う。
// id が重ならないことは lib/validate.ts で確認している。
type View =
  | { kind: "category"; category: Category; brands: readonly Brand[] }
  | { kind: "sub"; category: Category; sub: SubCategory; brands: readonly Brand[] };

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

export function generateStaticParams() {
  return [
    ...getCategoriesWithBrands(),
    ...getSubCategoriesWithBrands(),
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
  const subs = getSubCategoriesWithBrands(category.id);
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
                    className={chipClass(on)}
                  >
                    {t.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <ShowMore className={brandGridClass}>
        {brands.map((b) => {
          const best = getPairings(b.slug)[0];
          return (
            <li key={b.slug}>
              <BrandCard
                b={{
                  slug: b.slug,
                  name: b.name,
                  kindName: category.name,
                  sub: getSubCategory(b.subCategoryId)!.name,
                  maker: b.maker,
                  region: b.region,
                  tastes: b.tastes,
                  pair: best && getFood(best.foodSlug)!.name,
                  look: category.look,
                }}
              />
            </li>
          );
        })}
      </ShowMore>
    </div>
  );
}
