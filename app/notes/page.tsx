import type { Metadata } from "next";
import { ShowMore } from "@/components/ShowMore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NoteCard } from "@/components/NoteCard";
import { SectionHeading } from "@/components/ui";
import { getBrand, getFood, getNotes } from "@/lib/data";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/site";

// いまは既定の言語だけ（言語を足したらルートの params から）
const locale = defaultLocale;
const t = getDictionary(locale);

export const metadata: Metadata = pageMetadata({
  title: t.notesPage.title,
  description: t.notesPage.description,
  path: paths.notes(locale),
  locale,
});

export default function NotesPage() {
  const notes = getNotes();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        items={[{ label: t.common.home, href: paths.home(locale) }, { label: t.notesPage.title }]}
        locale={locale}
      />
      <SectionHeading as="h1" eyebrow="PAIRING NOTES" title={t.notesPage.title} />
      <ShowMore
        className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:gap-5"
        locale={locale}
      >
        {notes.map((n) => (
          <li key={n.slug} className="grid">
            <NoteCard
              href={paths.note(n.slug, locale)}
              title={n.title}
              brandName={getBrand(n.brandSlug)!.name}
              foodName={getFood(n.foodSlug)!.name}
              locale={locale}
            />
          </li>
        ))}
      </ShowMore>
    </div>
  );
}
