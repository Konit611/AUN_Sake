import type { Metadata } from "next";
import Link from "next/link";
import { NoteCard } from "@/components/NoteCard";
import { PairFinder, type FinderCategory } from "@/components/PairFinder";
import { Glyph, SectionHeading } from "@/components/ui";
import {
  getBrand,
  getBrandsByCategory,
  getBrandsBySubCategory,
  formatServe,
  getCategories,
  getCategoriesWithBrands,
  getFood,
  getNotes,
  getPairings,
  getRecommendedServe,
  getServeStyle,
  getSubCategories,
  getSubCategory,
} from "@/lib/data";
import { defaultLocale, format, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export const metadata: Metadata = pageMetadata({ path: paths.home(locale), locale });

// ホームで選べる銘柄は大分類ごとにこの数まで（content/brands/*.ts の並び順）。残りは /brands へ。
// 全銘柄をクライアントに渡すと、銘柄数に比例してホームが重くなるため
const FINDER_BRANDS_PER_CATEGORY = 8;
// 「お酒の分類から探す」の各行に並べる銘柄名の数
const TREE_NAMES = 3;

export default function Home() {
  const finder: FinderCategory[] = getCategoriesWithBrands().map((c) => {
    const all = getBrandsByCategory(c.id);
    return {
      id: c.id,
      name: c.name,
      total: all.length,
      brands: all.slice(0, FINDER_BRANDS_PER_CATEGORY).map((b) => ({
        slug: b.slug,
        name: b.name,
        sub: getSubCategory(b.subCategoryId)!.name,
        maker: b.maker,
        region: b.region,
        taste: b.taste,
        tags: b.tags,
        serve: formatServe(getRecommendedServe(b)),
        avoid: b.avoid,
        pairs: getPairings(b.slug).map((p, _, all) => ({
          id: p.id,
          food: getFood(p.foodSlug)!.name,
          foodSlug: p.foodSlug,
          level: p.level,
          why: p.why,
          // 同じ肴が飲み方違いで複数あるときだけ、どの飲み方の話かを添える
          serve:
            p.serveId && all.filter((x) => x.foodSlug === p.foodSlug).length > 1
              ? getServeStyle(p.serveId)!.name
              : undefined,
        })),
      })),
    };
  });

  // 銘柄か代表銘柄の例がある小分類だけ出す
  const tree = getCategories()
    .map((c) => ({
      ...c,
      subs: getSubCategories(c.id)
        .map((s) => ({
          ...s,
          names: [...getBrandsBySubCategory(s.id).map((b) => b.name), ...(s.examples ?? [])],
        }))
        .filter((s) => s.names.length > 0),
    }))
    .filter((c) => c.subs.length > 0);

  const notes = getNotes().slice(0, 3);

  return (
    <>
      {/* モバイルのヘッダーをホーム用の形にする目印（components/SiteHeader.tsx） */}
      <span data-page="home" hidden />
      {/* ヒーロー */}
      <section className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 pb-9 pt-10 md:flex-row md:flex-wrap md:items-center md:gap-12 md:px-6 md:pb-16 md:pt-20">
        <div className="flex min-w-0 flex-col gap-5 md:flex-[1_1_460px] md:gap-[22px]">
          <p className="text-[13px] font-bold tracking-[0.2em] text-accent md:text-sm">
            {t.home.catch}
          </p>
          <h1 className="text-4xl font-black leading-[1.35] md:text-[56px] md:leading-[1.3]">
            {t.home.titleLine1}
            <br />
            {t.home.titleLine2}
          </h1>
          <p className="hidden max-w-[480px] text-lg leading-[1.9] text-muted md:block">
            {t.home.intro}
          </p>
        </div>
        <div className="flex min-w-0 justify-center gap-3 md:flex-[1_1_420px] md:gap-5">
          <div className="flex h-[150px] flex-1 flex-col items-center justify-center gap-1 rounded-[80px_80px_16px_16px] border-2 border-line-strong md:aspect-[1/1.25] md:h-auto md:max-w-[220px] md:gap-2 md:rounded-[120px_120px_24px_24px]">
            <Glyph char="阿" className="text-[64px] md:text-[120px]" />
            <span className="text-xs tracking-[0.25em] text-muted md:text-[15px] md:tracking-[0.3em]">
              {t.home.aLabel}
            </span>
          </div>
          <div className="flex h-[150px] flex-1 flex-col items-center justify-center gap-1 rounded-[80px_80px_16px_16px] bg-accent text-bg md:aspect-[1/1.25] md:h-auto md:max-w-[220px] md:gap-2 md:rounded-[120px_120px_24px_24px]">
            <Glyph char="吽" className="text-[64px] md:text-[120px]" />
            <span className="text-xs font-bold tracking-[0.25em] md:text-[15px] md:tracking-[0.3em]">
              {t.home.unLabel}
            </span>
          </div>
        </div>
        <p className="text-[15px] leading-[1.9] text-muted md:hidden">
          {t.home.introShort}
        </p>
      </section>

      {/* 銘柄から探す */}
      <section id="pick" className="scroll-mt-16 border-y border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 py-9 md:gap-8 md:px-6 md:py-[72px]">
          <div className="px-5 md:px-0">
            <SectionHeading eyebrow="FIND YOUR PAIR" title={t.home.findTitle} />
          </div>
          <PairFinder categories={finder} locale={locale} />
          <p className="px-5 text-xs leading-[1.7] text-subtle md:px-0 md:text-[13px]">
            {t.subjective}
            <br className="md:hidden" />
            <span className="md:ml-2">
              {t.levelLegend}
            </span>
          </p>
        </div>
      </section>

      {/* お酒の分類 */}
      <section
        id="kinds"
        className="mx-auto flex max-w-[1200px] scroll-mt-16 flex-col gap-4 px-5 py-10 md:gap-7 md:px-6 md:py-[72px]"
      >
        <SectionHeading eyebrow="CATEGORIES" title={t.home.categoriesTitle} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(min(100%,500px),1fr))] md:gap-5">
          {tree.map((k) => (
            <div
              key={k.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface md:flex-row md:rounded-3xl"
            >
              {/* PC：左に大きな飾り文字 */}
              <Link
                href={paths.categories(locale, k.id)}
                className="hidden flex-[0_0_160px] flex-col items-center justify-center gap-2.5 border-r border-line bg-bg px-4 py-8 text-fg hover:text-accent-soft md:flex"
              >
                <Glyph char={k.glyph} className="text-[76px] text-accent" />
                <span className="text-[22px] font-black">{k.name}</span>
                <span className="text-xs tracking-[0.2em] text-subtle">{k.nameEn}</span>
              </Link>
              {/* モバイル：見出し行 */}
              <Link
                href={paths.categories(locale, k.id)}
                className="flex items-baseline justify-between gap-3 px-[18px] pb-2 pt-[18px] text-fg md:hidden"
              >
                <h3 className="text-xl font-black">{k.name}</h3>
                <span className="text-[11px] tracking-[0.15em] text-subtle">{k.nameEn}</span>
              </Link>
              <ul className="min-w-0 flex-1 px-[18px] pb-1.5 md:px-6 md:pb-3.5 md:pt-2.5">
                {k.subs.map((s) => (
                  <li key={s.id}>
                    <Link
                      // 専用ガイドの大分類（日本酒など）は小分類カードがないので、大分類の節へ
                      href={paths.categories(locale, k.guide === "custom" ? k.id : s.id)}
                      className="flex min-h-11 items-center justify-between gap-3 border-t border-line py-3 text-fg hover:text-accent-soft md:border-b md:border-t-0"
                    >
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[15px] font-bold md:text-base">{s.name}</span>
                        <span className="text-[13px] text-muted">
                          {s.names.slice(0, TREE_NAMES).join(t.common.sep)}
                          {s.names.length > TREE_NAMES &&
                            ` ${format(t.common.others, { count: s.names.length - TREE_NAMES })}`}
                        </span>
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="hidden flex-none text-subtle md:block"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ペアリングノート */}
      {notes.length > 0 && (
        <section
          id="notes"
          className="mx-auto flex max-w-[1200px] scroll-mt-16 flex-col gap-4 pb-12 md:gap-7 md:px-6 md:pb-20"
        >
          <div className="flex items-end justify-between gap-4 px-5 md:px-0">
            <SectionHeading eyebrow="PAIRING NOTES" title={t.home.notesTitle} />
            <Link
              href={paths.notes(locale)}
              className="flex-none py-3 text-sm font-bold text-accent hover:text-accent-soft md:text-[15px]"
            >
              {t.common.seeAll}
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 md:grid md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:gap-5 md:overflow-visible md:px-0 md:pb-0">
            {notes.map((n) => (
              <NoteCard
                key={n.slug}
                href={paths.note(n.slug, locale)}
                locale={locale}
                title={n.title}
                brandName={getBrand(n.brandSlug)!.name}
                foodName={getFood(n.foodSlug)!.name}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
