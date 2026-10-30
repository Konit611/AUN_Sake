import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Glyph, PairingBadge, PhotoPlaceholder } from "@/components/ui";
import { getBrand, getFood, getNote, getNotes, getPairings, getSubCategory } from "@/lib/data";

export function generateStaticParams() {
  return getNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};
  return { title: note.title, description: note.quote };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const brand = getBrand(note.brandSlug)!;
  const food = getFood(note.foodSlug)!;
  const pairing = getPairings(brand.slug).find((p) => p.foodSlug === food.slug);
  const { default: Body } = await import(`@/content/notes/${note.slug}.mdx`);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "ペアリングノート", href: "/notes" },
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
            <time dateTime={note.publishedAt}>{note.publishedAt.replaceAll("-", ".")}</time> ・{" "}
            {note.author}
          </p>
          <PhotoPlaceholder
            label={`[写真：${brand.name}と${food.name}]`}
            className="-mx-5 h-[220px] md:mx-0 md:h-[380px] md:rounded-[20px]"
          />
          <div className="flex flex-col gap-4 md:gap-[22px]">
            <Body />
          </div>
          {note.quote && (
            <div className="flex flex-col gap-1 rounded-[14px] bg-surface px-[18px] py-4 md:gap-1.5 md:rounded-2xl md:px-6 md:py-[22px]">
              <p className="text-[13px] font-bold text-accent md:text-sm">阿吽のひとこと</p>
              <p className="text-fg">{note.quote}</p>
            </div>
          )}
        </article>

        <aside
          aria-label="この組み合わせ"
          className="flex min-w-0 flex-col gap-3 md:sticky md:top-6 md:flex-[1_1_300px]"
        >
          <h2 className="text-base font-bold">この組み合わせ</h2>
          <Link
            href={`/brands/${brand.slug}`}
            className="flex flex-col gap-2 rounded-[18px] border-2 border-line-strong bg-surface p-5 text-fg hover:border-subtle"
          >
            <div className="flex items-center gap-2.5">
              <Glyph char="阿" className="text-[28px]" />
              <span className="text-xs tracking-[0.2em] text-muted">
                {getSubCategory(brand.subCategoryId)!.name} ・ {brand.region}
              </span>
            </div>
            <p className="text-xl font-black">{brand.name}</p>
            <p className="text-sm leading-[1.7] text-muted">{brand.taste}</p>
            <span className="pt-1 text-sm font-bold text-accent">銘柄ページを見る →</span>
          </Link>
          {pairing && (
            <div className="flex flex-col gap-2 rounded-[18px] border-2 border-accent bg-bg p-5">
              <div className="flex items-center gap-2.5">
                <Glyph char="吽" className="text-[28px] text-accent" />
                <PairingBadge level={pairing.level} />
                <span className="text-base font-bold">{food.name}</span>
              </div>
              <p className="text-sm leading-[1.75] text-muted">{pairing.why}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
