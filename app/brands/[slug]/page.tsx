import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { Glyph, PhotoPlaceholder } from "@/components/ui";
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
import { pageMetadata } from "@/lib/site";
import type { TasteChart } from "@/lib/types";

const CHART_LABELS: Record<keyof TasteChart, string> = {
  sweetness: "甘み",
  aroma: "香り",
  kire: "キレ",
  koku: "コク",
};

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};
  return pageMetadata({ title: brand.name, description: brand.taste, path: `/brands/${brand.slug}` });
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
      name: getServeStyle(serve.serveId)!.name,
      how: serve.how,
      note: serve.note,
      food: getFood(p.foodSlug)!.name,
      why: p.why,
    };
  });

  const note = getNotesByBrand(brand.slug)[0];
  const NoteBody = note
    ? (await import(`@/content/notes/${note.slug}.mdx`)).default
    : null;

  // 同じ小分類がなければ、同じ大分類から
  const sameSub = getRelatedBrands(brand.slug);
  const related =
    sameSub.length > 0
      ? { label: `ほかの${sub.name}`, brands: sameSub }
      : {
          label: `ほかの${category.name}`,
          brands: getBrandsByCategory(category.id).filter((b) => b.slug !== brand.slug),
        };

  const crumbs: Crumb[] = [
    { label: "ホーム", href: "/" },
    { label: category.name, href: "/#kinds" },
    { label: sub.name, href: `/categories/${sub.id}` },
    { label: brand.name },
  ];

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col pb-10 md:gap-14 md:px-6 md:pb-20 md:pt-2">
      <Breadcrumbs items={crumbs} className="hidden md:block" />

      {/* 銘柄 */}
      <section className="flex flex-col md:flex-row md:flex-wrap md:items-stretch md:gap-10">
        <PhotoPlaceholder
          label={`[写真：${brand.name} ボトル]`}
          className="h-[300px] md:h-auto md:min-h-[420px] md:min-w-0 md:flex-[1_1_320px] md:rounded-3xl"
        />
        <div className="flex min-w-0 flex-col justify-center gap-3.5 px-5 pb-8 pt-6 md:flex-[2_1_520px] md:gap-[18px] md:p-0">
          {/* モバイルは写真の下に、現在のページを除いて出す */}
          <Breadcrumbs items={crumbs.slice(0, -1)} className="md:hidden" />
          <div className="flex items-center gap-2.5 md:gap-3">
            <Glyph char="阿" className="text-[34px] md:text-[44px]" />
            <span className="text-xs tracking-[0.2em] text-muted md:text-sm">
              {sub.name} ・ {brand.region}
            </span>
          </div>
          <h1 className="text-[40px] font-black leading-[1.2] md:text-[60px]">{brand.name}</h1>
          <p className="text-[13px] text-muted md:text-[15px]">
            {[brand.maker, sub.name, ...(brand.abv ? [`${brand.abv}度`] : [])].join(" ・ ")}
          </p>
          <p className="text-[15px] leading-[1.9] text-fg-2 md:text-lg">{brand.taste}</p>
          <ul className="flex flex-wrap gap-1.5">
            {brand.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-line-strong px-2.5 py-1 text-xs text-fg-2 md:text-[13px]"
              >
                {t}
              </li>
            ))}
          </ul>
          {brand.tasteChart && (
            <div className="flex flex-col gap-2.5 rounded-2xl bg-surface px-[18px] py-4 md:bg-transparent md:p-0 md:pt-2">
              <p className="text-xs text-subtle md:text-[13px]">味わいチャート（AUN編集部の主観）</p>
              {(Object.keys(CHART_LABELS) as (keyof TasteChart)[]).map((key) => {
                const v = brand.tasteChart![key];
                return (
                  <div key={key} className="flex items-center gap-3 md:gap-3.5">
                    <span className="w-10 text-[13px] text-fg-2 md:w-14 md:text-sm">
                      {CHART_LABELS[key]}
                    </span>
                    <div
                      role="img"
                      aria-label={`${CHART_LABELS[key]} 5段階中${v}`}
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
            <h2 className="text-2xl font-black md:text-4xl">飲み方別、息の合う肴</h2>
          </div>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] md:gap-5">
            {serveCards.map((c) => (
              <div
                key={c.name}
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
                    <p className="text-base font-bold md:text-[19px]">{c.food}</p>
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
        {note && NoteBody && (
          <article
            id="note"
            className="flex min-w-0 scroll-mt-16 flex-col gap-4 px-5 py-9 text-base leading-[1.95] text-fg-2 md:flex-[999_1_560px] md:gap-[22px] md:p-0 md:text-lg"
          >
            <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">PAIRING NOTE</p>
            <h2 className="text-2xl font-black leading-[1.45] text-fg md:text-[34px] md:leading-[1.4]">
              <Link href={`/notes/${note.slug}`} className="hover:text-accent-soft">
                {note.title}
              </Link>
            </h2>
            <p className="text-xs text-subtle md:text-sm">
              <time dateTime={note.publishedAt}>{note.publishedAt.replaceAll("-", ".")}</time> ・{" "}
              {note.author}
            </p>
            <div className="flex flex-col gap-4 md:gap-[22px]">
              <NoteBody />
            </div>
            {note.quote && (
              <div className="flex flex-col gap-1 rounded-[14px] bg-surface px-[18px] py-4 md:gap-1.5 md:rounded-2xl md:px-6 md:py-[22px]">
                <p className="text-[13px] font-bold text-accent md:text-sm">阿吽のひとこと</p>
                <p className="text-fg">{note.quote}</p>
              </div>
            )}
          </article>
        )}

        {related.brands.length > 0 && (
          <aside
            aria-label="同じ分類の銘柄"
            className="flex min-w-0 flex-col gap-2.5 px-5 md:flex-[1_1_300px] md:gap-3 md:p-0"
          >
            <h2 className="text-base font-bold">{related.label}</h2>
            {related.brands.map((b) => (
              <Link
                key={b.slug}
                href={`/brands/${b.slug}`}
                className="flex min-h-[52px] items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-4 text-fg hover:border-line-strong md:px-[18px] md:py-4"
              >
                <span className="font-bold">{b.name}</span>
                <span className="text-[13px] text-muted md:text-sm">
                  {b.maker} ・ {b.region}
                </span>
              </Link>
            ))}
          </aside>
        )}
      </section>
    </div>
  );
}
