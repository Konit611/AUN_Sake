import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { Glyph, PhotoPlaceholder, TagList } from "@/components/ui";
import {
  getBrand,
  getBrands,
  getBrandsByCategory,
  getCategory,
  getFood,
  getNotesByBrand,
  getRelatedBrands,
  getServePairings,
  getServeStyle,
  getSubCategory,
} from "@/lib/data";
import { defaultLocale, format, formatDate, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";
import type { TasteChart } from "@/lib/types";

const CHART_AXES: (keyof TasteChart)[] = ["sweetness", "aroma", "kire", "koku"];

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

// 「ほかの○○」に並べる数。残りは分類ページへ
const RELATED_LIMIT = 6;

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};
  return pageMetadata({
    title: brand.name,
    description: brand.taste,
    path: paths.brand(brand.slug, locale),
    image: `${paths.brand(brand.slug, locale)}/opengraph-image`,
    locale,
  });
}

export default async function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const sub = getSubCategory(brand.subCategoryId)!;
  const category = getCategory(brand.categoryId)!;

  const serveCards = getServePairings(brand.slug).map((p) => {
    const serve = brand.serves.find((s) => s.serveId === p.serveId)!;
    return {
      id: p.id,
      name: getServeStyle(serve.serveId)!.name,
      how: serve.how,
      note: serve.note,
      food: getFood(p.foodSlug)!.name,
      foodSlug: p.foodSlug,
      why: p.why,
    };
  });

  // 本文はノートのページにだけ置き、ここは最新の 1 本の抜粋（同じ本文が 2 か所に出ないように）
  const [note, ...olderNotes] = getNotesByBrand(brand.slug);

  // 同じ小分類がなければ、同じ大分類から
  const sameSub = getRelatedBrands(brand.slug);
  const related =
    sameSub.length > 0
      ? { label: format(t.brandPage.otherOf, { name: sub.name }), brands: sameSub, href: paths.category(sub.id, locale) }
      : {
          label: format(t.brandPage.otherOf, { name: category.name }),
          brands: getBrandsByCategory(category.id).filter((b) => b.slug !== brand.slug),
          href: paths.category(category.id, locale),
        };

  const crumbs: Crumb[] = [
    { label: t.common.home, href: paths.home(locale) },
    { label: category.name, href: paths.category(category.id, locale) },
    { label: sub.name, href: paths.category(sub.id, locale) },
    { label: brand.name },
  ];

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col pb-10 md:gap-14 md:px-6 md:pb-20 md:pt-2">
      <Breadcrumbs items={crumbs} locale={locale} className="hidden md:block" />

      {/* 銘柄 */}
      <section className="flex flex-col md:flex-row md:flex-wrap md:items-stretch md:gap-10">
        <PhotoPlaceholder
          label={format(t.common.photoBottle, { name: brand.name })}
          className="h-[300px] md:h-auto md:min-h-[420px] md:min-w-0 md:flex-[1_1_320px] md:rounded-3xl"
        />
        <div className="flex min-w-0 flex-col justify-center gap-3.5 px-5 pb-8 pt-6 md:flex-[2_1_520px] md:gap-[18px] md:p-0">
          {/* モバイルは写真の下に、現在のページを除いて出す */}
          <Breadcrumbs items={crumbs.slice(0, -1)} locale={locale} className="md:hidden" />
          <div className="flex items-center gap-2.5 md:gap-3">
            <Glyph char="阿" className="text-[34px] md:text-[44px]" />
            <span className="text-xs tracking-[0.2em] text-muted md:text-sm">
              {[sub.name, brand.region].join(t.common.sep)}
            </span>
          </div>
          <h1 className="text-[40px] font-black leading-[1.2] md:text-[60px]">{brand.name}</h1>
          <p className="text-[13px] text-muted md:text-[15px]">
            {[brand.maker, sub.name, ...(brand.abv ? [format(t.common.abv, { abv: brand.abv })] : [])].join(
              t.common.sep,
            )}
          </p>
          <p className="text-[15px] leading-[1.9] text-fg-2 md:text-lg">{brand.taste}</p>
          <TagList tags={brand.tags} />
          {brand.tasteChart && (
            <div className="flex flex-col gap-2.5 rounded-2xl bg-surface px-[18px] py-4 md:bg-transparent md:p-0 md:pt-2">
              <p className="text-xs text-subtle md:text-[13px]">{t.chart.title}</p>
              {CHART_AXES.map((key) => {
                const v = brand.tasteChart![key];
                return (
                  <div key={key} className="flex items-center gap-3 md:gap-3.5">
                    <span className="w-10 text-[13px] text-fg-2 md:w-14 md:text-sm">
                      {t.chart[key]}
                    </span>
                    <div
                      role="img"
                      aria-label={format(t.chart.aria, { label: t.chart[key], value: v })}
                      className="flex flex-1 gap-[5px] md:gap-1.5"
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`h-2.5 flex-1 rounded-[3px] ${i <= v ? "bg-accent" : "bg-track"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 飲み方別 */}
      {serveCards.length > 0 && (
        <section className="flex flex-col gap-3.5 border-y border-line bg-surface px-5 py-8 md:gap-6 md:border-0 md:bg-transparent md:p-0">
          <div className="flex flex-col gap-2 md:gap-2.5">
            <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">
              BY SERVING STYLE
            </p>
            <h2 className="text-2xl font-black md:text-4xl">{t.brandPage.byServe}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] md:gap-5">
            {serveCards.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-2.5 rounded-2xl border border-line bg-bg p-[18px] md:gap-3.5 md:rounded-[20px] md:bg-surface md:p-[26px]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[19px] font-black md:text-2xl">{c.name}</h3>
                  {c.how && <span className="text-xs text-muted md:text-[13px]">{c.how}</span>}
                </div>
                {c.note && (
                  <p className="text-sm leading-[1.7] text-muted md:text-[15px]">{c.note}</p>
                )}
                <div className="flex items-center gap-3 rounded-xl border-2 border-accent px-3.5 py-3 md:gap-3.5 md:rounded-[14px] md:p-4">
                  <Glyph char="吽" className="text-[28px] text-accent md:text-[34px]" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-base font-bold md:text-[19px]">
                      <Link href={paths.food(c.foodSlug, locale)} className="hover:text-accent-soft">
                        {c.food}
                      </Link>
                    </p>
                    <p className="text-[13px] leading-[1.6] text-fg-2 md:text-sm">{c.why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ペアリングノート + ほかの銘柄 */}
      <section className="flex flex-col md:flex-row md:flex-wrap md:items-start md:gap-12 md:border-t md:border-line md:pt-12">
        {note && (
          <article
            id="note"
            className="flex min-w-0 scroll-mt-16 flex-col gap-4 px-5 py-9 text-base leading-[1.95] text-fg-2 md:flex-[999_1_560px] md:gap-[22px] md:p-0 md:text-lg"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">PAIRING NOTE</p>
            <h2 className="text-2xl font-black leading-[1.45] text-fg md:text-[34px] md:leading-[1.4]">
              <Link href={paths.note(note.slug, locale)} className="hover:text-accent-soft">
                {note.title}
              </Link>
            </h2>
            <p className="text-xs text-subtle md:text-sm">
              <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
              {t.common.sep}
              {note.author}
            </p>
            {note.lead && <p>{note.lead}</p>}
            {note.quote && (
              <div className="flex flex-col gap-1 rounded-[14px] bg-surface px-[18px] py-4 md:gap-1.5 md:rounded-2xl md:px-6 md:py-[22px]">
                <p className="text-[13px] font-bold text-accent md:text-sm">{t.common.oneWord}</p>
                <p className="text-fg">{note.quote}</p>
              </div>
            )}
            <Link
              href={paths.note(note.slug, locale)}
              className="self-start py-2 text-[15px] font-bold text-accent hover:text-accent-soft"
            >
              {t.common.readMore}
            </Link>
            {olderNotes.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-line pt-5">
                <h3 className="text-sm font-bold text-fg md:text-base">
                  {format(t.brandPage.otherNotes, { name: brand.name })}
                </h3>
                <ul className="flex flex-col">
                  {olderNotes.slice(0, 5).map((n) => (
                    <li key={n.slug}>
                      <Link
                        href={paths.note(n.slug, locale)}
                        className="flex min-h-11 items-baseline justify-between gap-4 py-2 text-[15px] text-fg hover:text-accent-soft"
                      >
                        <span>{n.title}</span>
                        <time dateTime={n.publishedAt} className="flex-none text-xs text-subtle">
                          {formatDate(n.publishedAt, locale)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        )}

        {related.brands.length > 0 && (
          <aside
            aria-label={t.brandPage.relatedLabel}
            className="flex min-w-0 flex-col gap-2.5 px-5 md:flex-[1_1_300px] md:gap-3 md:p-0"
          >
            <h2 className="text-base font-bold">{related.label}</h2>
            {related.brands.slice(0, RELATED_LIMIT).map((b) => (
              <Link
                key={b.slug}
                href={paths.brand(b.slug, locale)}
                className="flex min-h-[52px] items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-4 text-fg hover:border-line-strong md:px-[18px] md:py-4"
              >
                <span className="font-bold">{b.name}</span>
                <span className="text-[13px] text-muted md:text-sm">
                  {[b.maker, b.region].join(t.common.sep)}
                </span>
              </Link>
            ))}
            {related.brands.length > RELATED_LIMIT && (
              <Link
                href={related.href}
                className="py-2 text-sm font-bold text-accent hover:text-accent-soft"
              >
                {format(t.common.seeAllCount, { count: related.brands.length })}
              </Link>
            )}
          </aside>
        )}
      </section>
    </div>
  );
}
