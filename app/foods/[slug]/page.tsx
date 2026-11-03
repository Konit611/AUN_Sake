import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShowMore } from "@/components/ShowMore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NoteCard } from "@/components/NoteCard";
import { Glyph, PairingBadge, SectionHeading } from "@/components/ui";
import {
  getBrand,
  getFood,
  getFoodsWithPairings,
  getNotes,
  getPairingsByFood,
  getServeStyle,
  getSubCategory,
} from "@/lib/data";
import { defaultLocale, format, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export async function generateStaticParams() {
  return (await getFoodsWithPairings(locale)).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/foods/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFood(slug, locale);
  if (!food) return {};
  return pageMetadata({
    title: format(t.foodPage.title, { name: food.name }),
    description: format(t.foodPage.description, { name: food.name }),
    path: paths.food(food.slug, locale),
    locale,
  });
}

export default async function FoodPage({ params }: PageProps<"/foods/[slug]">) {
  const { slug } = await params;
  const food = await getFood(slug, locale);
  const found = food ? await getPairingsByFood(food.slug, locale) : [];
  if (!food || found.length === 0) notFound();

  const pairings = await Promise.all(
    found.map(async (p) => {
      const brand = (await getBrand(p.brandSlug, locale))!;
      return {
        ...p,
        brand,
        subName: (await getSubCategory(brand.subCategoryId, locale))!.name,
        serve: p.serveId ? (await getServeStyle(p.serveId, locale))!.name : undefined,
      };
    }),
  );
  const notes = await Promise.all(
    (await getNotes(locale))
      .filter((n) => n.foodSlug === food.slug)
      .map(async (n) => ({ ...n, brandName: (await getBrand(n.brandSlug, locale))!.name })),
  );

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        locale={locale}
        items={[
          { label: t.common.home, href: paths.home(locale) },
          { label: t.foodsPage.title, href: paths.foods(locale) },
          { label: food.name },
        ]}
      />

      <div className="flex items-center gap-4 md:gap-6">
        <Glyph char="吽" className="text-[56px] text-accent md:text-[88px]" />
        <div className="flex flex-col gap-2">
          <SectionHeading as="h1" eyebrow="FIND YOUR PAIR" title={food.name} />
          <p className="text-sm text-muted md:text-[15px]">
            {format(t.foodPage.count, { count: pairings.length })}
          </p>
        </div>
      </div>

      <ShowMore className="flex flex-col gap-4 md:gap-5" locale={locale}>
        {pairings.map(({ brand, serve, subName, ...p }) => (
          <li key={p.id}>
            <Link
              href={paths.brand(brand.slug, locale)}
              className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface p-5 text-fg hover:border-line-strong md:grid-cols-[auto_minmax(0,280px)_1fr] md:gap-x-6 md:rounded-[20px] md:p-[26px]"
            >
              <PairingBadge level={p.level} locale={locale} />
              <div className="flex flex-col gap-0.5">
                <p className="text-xl font-black md:text-[22px]">{brand.name}</p>
                <p className="text-[13px] text-muted">
                  {[subName, brand.maker].join(t.common.sep)}
                  {serve && `${t.common.sep}${format(t.common.servedAs, { serve })}`}
                </p>
              </div>
              <p className="col-span-2 text-sm leading-[1.75] text-fg-2 md:col-span-1 md:text-[15px]">
                {p.why}
              </p>
            </Link>
          </li>
        ))}
      </ShowMore>

      {notes.length > 0 && (
        <section className="flex flex-col gap-4 md:gap-6">
          <h2 className="text-xl font-black md:text-2xl">
            {format(t.foodPage.notesOf, { name: food.name })}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:gap-5">
            {notes.map((n) => (
              <NoteCard
                key={n.slug}
                href={paths.note(n.slug, locale)}
                title={n.title}
                brandName={n.brandName}
                foodName={food.name}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
