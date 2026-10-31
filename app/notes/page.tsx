import type { Metadata } from "next";
import { ShowMore } from "@/components/ShowMore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NoteCard } from "@/components/NoteCard";
import { SectionHeading } from "@/components/ui";
import { getBrand, getFood, getNotes } from "@/lib/data";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "ペアリングノート",
  description: "一本の酒と一皿の肴を実際に合わせてみた記録。",
  path: "/notes",
});

export default function NotesPage() {
  const notes = getNotes();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs items={[{ label: "ホーム", href: "/" }, { label: "ペアリングノート" }]} />
      <SectionHeading as="h1" eyebrow="PAIRING NOTES" title="ペアリングノート" />
      <ShowMore className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:gap-5">
        {notes.map((n) => (
          <li key={n.slug} className="grid">
            <NoteCard
              href={`/notes/${n.slug}`}
              title={n.title}
              brandName={getBrand(n.brandSlug)!.name}
              foodName={getFood(n.foodSlug)!.name}
            />
          </li>
        ))}
      </ShowMore>
    </div>
  );
}
