import type { Metadata } from "next";
import Link from "next/link";
import { ShowMore } from "@/components/ShowMore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PairingBadge, SectionHeading } from "@/components/ui";
import { getBrand, getFoodsWithPairings, getPairingsByFood } from "@/lib/data";
import { defaultLocale, format, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export const metadata: Metadata = pageMetadata({
  title: t.foodsPage.title,
  description: t.foodsPage.description,
  path: paths.foods(locale),
  locale,
});

export default async function FoodsPage() {
  const foods = await Promise.all(
    (await getFoodsWithPairings(locale)).map(async (f) => {
      // getPairingsByFood は 阿吽 → 好相性 → 意外 の順
      const pairings = await getPairingsByFood(f.slug, locale);
      return { ...f, pairings, bestBrandName: (await getBrand(pairings[0].brandSlug, locale))!.name };
    }),
  );

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        items={[{ label: t.common.home, href: paths.home(locale) }, { label: t.foodsPage.title }]}
        locale={locale}
      />
      <div className="flex flex-col gap-3">
        <SectionHeading as="h1" eyebrow="BY FOOD" title={t.foodsPage.heading} />
        <p className="text-sm text-muted md:text-[15px]">{format(t.foodsPage.count, { count: foods.length })}</p>
      </div>
      <ShowMore
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:gap-4"
        locale={locale}
      >
        {foods.map((f) => {
          // getPairingsByFood は 阿吽 → 好相性 → 意外 の順
          const best = f.pairings[0];
          return (
            <li key={f.slug}>
              <Link
                href={paths.food(f.slug, locale)}
                className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface px-[18px] py-4 text-fg hover:border-line-strong"
              >
                <p className="text-lg font-bold">{f.name}</p>
                <p className="flex items-center gap-2 text-[13px] text-muted">
                  <PairingBadge level={best.level} locale={locale} />
                  <span>
                    {f.bestBrandName}
                    {f.pairings.length > 1 && ` ${format(t.common.othersBrands, { count: f.pairings.length - 1 })}`}
                  </span>
                </p>
              </Link>
            </li>
          );
        })}
      </ShowMore>
    </div>
  );
}
