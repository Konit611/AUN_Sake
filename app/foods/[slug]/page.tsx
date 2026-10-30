import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NoteCard } from "@/components/NoteCard";
import { Glyph, PairingBadge, SectionHeading } from "@/components/ui";
import {
  getBrand,
  getFood,
  getFoods,
  getNotes,
  getPairingsByFood,
  getServeStyle,
  getSubCategory,
} from "@/lib/data";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return getFoods()
    .filter((f) => getPairingsByFood(f.slug).length > 0)
    .map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/foods/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const food = getFood(slug);
  if (!food) return {};
  return pageMetadata({
    title: `${food.name}に合うお酒`,
    description: `${food.name}と息の合う銘柄と、その理由。`,
    path: `/foods/${food.slug}`,
  });
}

export default async function FoodPage({ params }: PageProps<"/foods/[slug]">) {
  const { slug } = await params;
  const food = getFood(slug);
  const pairings = food ? getPairingsByFood(food.slug) : [];
  if (!food || pairings.length === 0) notFound();

  const notes = getNotes().filter((n) => n.foodSlug === food.slug);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs
        items={[
          { label: "ホーム", href: "/" },
          { label: "肴から探す", href: "/foods" },
          { label: food.name },
        ]}
      />

      <div className="flex items-center gap-4 md:gap-6">
        <Glyph char="吽" className="text-[56px] text-accent md:text-[88px]" />
        <div className="flex flex-col gap-2">
          <SectionHeading as="h1" eyebrow="FIND YOUR PAIR" title={food.name} />
          <p className="text-sm text-muted md:text-[15px]">
            息の合うお酒 ・ {pairings.length}銘柄
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-4 md:gap-5">
        {pairings.map((p) => {
          const brand = getBrand(p.brandSlug)!;
          const serve = p.serveId ? getServeStyle(p.serveId)!.name : undefined;
          return (
            <li key={p.brandSlug}>
              <Link
                href={`/brands/${brand.slug}`}
                className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface p-5 text-fg hover:border-line-strong md:grid-cols-[auto_minmax(0,280px)_1fr] md:gap-x-6 md:rounded-[20px] md:p-[26px]"
              >
                <PairingBadge level={p.level} />
                <div className="flex flex-col gap-0.5">
                  <p className="text-xl font-black md:text-[22px]">{brand.name}</p>
                  <p className="text-[13px] text-muted">
                    {getSubCategory(brand.subCategoryId)!.name} ・ {brand.maker}
                    {serve && ` ・ ${serve}で`}
                  </p>
                </div>
                <p className="col-span-2 text-sm leading-[1.75] text-fg-2 md:col-span-1 md:text-[15px]">
                  {p.why}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {notes.length > 0 && (
        <section className="flex flex-col gap-4 md:gap-6">
          <h2 className="text-xl font-black md:text-2xl">{food.name}のペアリングノート</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:gap-5">
            {notes.map((n) => (
              <NoteCard
                key={n.slug}
                href={`/notes/${n.slug}`}
                title={n.title}
                brandName={getBrand(n.brandSlug)!.name}
                foodName={food.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
