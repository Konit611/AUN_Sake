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
import { defaultLocale, format, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";
import type { Brand, Category, SubCategory } from "@/lib/types";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

// /categories/shochu（大分類）と /categories/imo-shochu（小分類）を同じルートで扱う。
// id が重ならないことは lib/validate.ts で確認している。
type View =
  | { kind: "category"; category: Category; brands: readonly Brand[] }
  | { kind: "sub"; category: Category; sub: SubCategory; brands: readonly Brand[] };

async function resolve(id: string): Promise<View | undefined> {
  const category = await getCategory(id, locale);
  if (category) {
    const brands = await getBrandsByCategory(category.id, locale);
    return brands.length > 0 ? { kind: "category", category, brands } : undefined;
  }
  const sub = await getSubCategory(id, locale);
  if (sub) {
    const brands = await getBrandsBySubCategory(sub.id, locale);
    if (brands.length === 0) return undefined;
    return { kind: "sub", category: (await getCategory(sub.categoryId, locale))!, sub, brands };
  }
}

export async function generateStaticParams() {
  const [categories, subCategories] = await Promise.all([
    getCategoriesWithBrands(locale),
    getSubCategoriesWithBrands(undefined, locale),
  ]);
  return [...categories, ...subCategories].map((x) => ({ id: x.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/categories/[id]">): Promise<Metadata> {
  const { id } = await params;
  const view = await resolve(id);
  if (!view) return {};
  const name = view.kind === "sub" ? view.sub.name : view.category.name;
  return pageMetadata({
    title: name,
    description: format(t.categoryPage.description, { name }),
    path: paths.category(id, locale),
    locale,
  });
}

export default async function CategoryPage({ params }: PageProps<"/categories/[id]">) {
  const { id } = await params;
  const view = await resolve(id);
  if (!view) notFound();

  const { category } = view;
  const subs = await getSubCategoriesWithBrands(category.id, locale);
  const brands = await Promise.all(
    view.brands.map(async (b) => {
      const best = (await getPairings(b.slug, locale))[0];
      return {
        ...b,
        subName: (await getSubCategory(b.subCategoryId, locale))!.name,
        pairName: best && (await getFood(best.foodSlug, locale))!.name,
      };
    }),
  );
  const crumbs: Crumb[] = [
    { label: t.common.home, href: paths.home(locale) },
    { label: t.categoriesPage.title, href: paths.categories(locale) },
    { label: category.name, href: paths.category(category.id, locale) },
    ...(view.kind === "sub" ? [{ label: view.sub.name }] : []),
  ];
  const tabs = [
    { id: category.id, name: t.common.all },
    ...subs.map((s) => ({ id: s.id, name: s.name })),
  ];

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs items={crumbs} locale={locale} />

      <div className="flex flex-col gap-3">
        <SectionHeading
          as="h1"
          eyebrow={category.nameEn}
          title={view.kind === "sub" ? view.sub.name : category.name}
        />
        <p className="text-sm text-muted md:text-[15px]">
          {format(t.common.brandCount, { count: brands.length })}
        </p>
      </div>

      {subs.length > 1 && (
        <nav
          aria-label={format(t.categoryPage.tabs, { name: category.name })}
          className="-mx-5 md:mx-0"
        >
          <ul className="flex gap-2 overflow-x-auto px-5 pb-1 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
            {tabs.map((tab) => {
              const on = tab.id === id;
              return (
                <li key={tab.id} className="flex-none">
                  <Link
                    href={paths.category(tab.id, locale)}
                    aria-current={on ? "page" : undefined}
                    className={chipClass(on)}
                  >
                    {tab.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <ShowMore className={brandGridClass} locale={locale}>
        {brands.map((b) => (
          <li key={b.slug}>
            <BrandCard
              locale={locale}
              b={{
                slug: b.slug,
                name: b.name,
                kindName: category.name,
                sub: b.subName,
                maker: b.maker,
                region: b.region,
                tastes: b.tastes,
                pair: b.pairName,
                look: category.look,
              }}
            />
          </li>
        ))}
      </ShowMore>
    </div>
  );
}
