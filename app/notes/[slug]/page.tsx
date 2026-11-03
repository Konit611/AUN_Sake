import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NoteCard } from "@/components/NoteCard";
import { Glyph, PairingBadge, PhotoPlaceholder } from "@/components/ui";
import { getBrand, getFood, getNote, getNotes, getPairings, getRelatedNotes, getSubCategory } from "@/lib/data";
import { pairingId } from "@/lib/types";
import { defaultLocale, format, formatDate, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export async function generateStaticParams() {
  return (await getNotes(locale)).map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(slug, locale);
  if (!note) return {};
  return pageMetadata({
    title: note.title,
    description: note.lead ?? note.quote,
    path: paths.note(note.slug, locale),
    type: "article",
    image: `${paths.note(note.slug, locale)}/opengraph-image`,
    locale,
  });
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const note = await getNote(slug, locale);
  if (!note) notFound();

  const brand = (await getBrand(note.brandSlug, locale))!;
  const food = (await getFood(note.foodSlug, locale))!;
  const subName = (await getSubCategory(brand.subCategoryId, locale))!.name;
  // 飲み方つきのノートはその飲み方のペアリング、なければ同じ肴の最初のもの
  const brandPairings = await getPairings(brand.slug, locale);
  const pairing =
    brandPairings.find((p) => p.id === pairingId(brand.slug, food.slug, note.serveId)) ??
    brandPairings.find((p) => p.foodSlug === food.slug);
  const related = await Promise.all(
    (await getRelatedNotes(note.slug, undefined, locale)).map(async (n) => ({
      ...n,
      brandName: (await getBrand(n.brandSlug, locale))!.name,
      foodName: (await getFood(n.foodSlug, locale))!.name,
    })),
  );
  const { default: Body } = await import(`@/content/notes/${note.slug}.mdx`);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        locale={locale}
        items={[
          { label: t.common.home, href: paths.home(locale) },
          { label: t.notesPage.title, href: paths.notes(locale) },
          { label: note.title },
        ]}
      />

      <div className="flex flex-col gap-10 md:flex-row md:flex-wrap md:items-start md:gap-12">
        <article className="flex min-w-0 flex-col gap-4 text-base leading-[1.95] text-fg-2 md:flex-[999_1_560px] md:gap-[22px] md:text-lg">
          <p className="text-sm text-muted md:text-[15px]">
            <span className="font-bold text-fg">阿</span> {brand.name}
            <span className="mx-1.5">×</span>
            <span className="font-bold text-accent">吽</span> {food.name}
          </p>
          <h1 className="text-[28px] font-black leading-[1.45] text-fg md:text-[40px] md:leading-[1.4]">
            {note.title}
          </h1>
          <p className="text-xs text-subtle md:text-sm">
            <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
            {t.common.sep}
            {note.author}
          </p>
          <PhotoPlaceholder
            label={format(t.common.photoPair, { brand: brand.name, food: food.name })}
            className="-mx-5 h-[220px] md:mx-0 md:h-[380px] md:rounded-[20px]"
          />
          <div className="flex flex-col gap-4 md:gap-[22px]">
            <Body />
          </div>
          {note.quote && (
            <div className="flex flex-col gap-1 rounded-[14px] bg-surface px-[18px] py-4 md:gap-1.5 md:rounded-2xl md:px-6 md:py-[22px]">
              <p className="text-[13px] font-bold text-accent md:text-sm">{t.common.oneWord}</p>
              <p className="text-fg">{note.quote}</p>
            </div>
          )}
        </article>

        <aside
          aria-label={t.notePage.pairing}
          className="flex min-w-0 flex-col gap-3 md:sticky md:top-6 md:flex-[1_1_300px]"
        >
          <h2 className="text-base font-bold">{t.notePage.pairing}</h2>
          <Link
            href={paths.brand(brand.slug, locale)}
            className="flex flex-col gap-2 rounded-[18px] border-2 border-line-strong bg-surface p-5 text-fg hover:border-subtle"
          >
            <div className="flex items-center gap-2.5">
              <Glyph char="阿" className="text-[28px]" />
              <span className="text-xs tracking-[0.2em] text-muted">
                {[subName, brand.region].join(t.common.sep)}
              </span>
            </div>
            <p className="text-xl font-black">{brand.name}</p>
            <p className="text-sm leading-[1.7] text-muted">{brand.taste}</p>
            <span className="pt-1 text-sm font-bold text-accent">{t.common.toBrandPage}</span>
          </Link>
          {pairing && (
            <div className="flex flex-col gap-2 rounded-[18px] border-2 border-accent bg-bg p-5">
              <div className="flex items-center gap-2.5">
                <Glyph char="吽" className="text-[28px] text-accent" />
                <PairingBadge level={pairing.level} locale={locale} />
                <Link href={paths.food(food.slug, locale)} className="text-base font-bold hover:text-accent-soft">
                  {food.name}
                </Link>
              </div>
              <p className="text-sm leading-[1.75] text-muted">{pairing.why}</p>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-line pt-8 md:gap-6 md:pt-12">
          <h2 className="text-xl font-black md:text-2xl">{t.notePage.related}</h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {related.map((n) => (
              <li key={n.slug} className="grid">
                <NoteCard
                  href={paths.note(n.slug, locale)}
                  title={n.title}
                  brandName={n.brandName}
                  foodName={n.foodName}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
