import type { Metadata } from "next";
import Link from "next/link";
import { ShowMore } from "@/components/ShowMore";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PairingBadge, SectionHeading } from "@/components/ui";
import { getBrand, getFoodsWithPairings, getPairingsByFood } from "@/lib/data";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "肴から探す",
  description: "今日の肴に、息の合うお酒を。",
  path: "/foods",
});

export default function FoodsPage() {
  const foods = getFoodsWithPairings().map((f) => ({ ...f, pairings: getPairingsByFood(f.slug) }));

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 pb-12 pt-2 md:gap-10 md:px-6 md:pb-20">
      <Breadcrumbs items={[{ label: "ホーム", href: "/" }, { label: "肴から探す" }]} />
      <div className="flex flex-col gap-3">
        <SectionHeading as="h1" eyebrow="BY FOOD" title="肴から、息の合う酒を探す" />
        <p className="text-sm text-muted md:text-[15px]">{foods.length}品</p>
      </div>
      <ShowMore className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:gap-4">
        {foods.map((f) => {
          // getPairingsByFood は 阿吽 → 好相性 → 意外 の順
          const best = f.pairings[0];
          return (
            <li key={f.slug}>
              <Link
                href={`/foods/${f.slug}`}
                className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface px-[18px] py-4 text-fg hover:border-line-strong"
              >
                <p className="text-lg font-bold">{f.name}</p>
                <p className="flex items-center gap-2 text-[13px] text-muted">
                  <PairingBadge level={best.level} />
                  <span>
                    {getBrand(best.brandSlug)!.name}
                    {f.pairings.length > 1 && ` ほか${f.pairings.length - 1}銘柄`}
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
