import { getBrand, getFood, getNotes } from "@/lib/data";
import { defaultLocale, format, getDictionary, htmlLang } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

// ペアリングノートの RSS 2.0。週 1 回の更新を購読できるように
const LIMIT = 20;

function escape(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// いまは既定の言語だけ（言語を足したら言語ごとのフィードにする）
const locale = defaultLocale;

export async function GET() {
  const t = getDictionary(locale);
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const notes = await Promise.all(
    (await getNotes(locale)).slice(0, LIMIT).map(async (n) => ({
      ...n,
      brandName: (await getBrand(n.brandSlug, locale))!.name,
      foodName: (await getFood(n.foodSlug, locale))!.name,
    })),
  );

  const items = notes
    .map((n) => {
      const summary =
        n.lead ??
        format(n.quote ? t.feed.summaryWithQuote : t.feed.summary, {
          brand: n.brandName,
          food: n.foodName,
          quote: n.quote ?? "",
        });
      return `    <item>
      <title>${escape(n.title)}</title>
      <link>${url(paths.note(n.slug, locale))}</link>
      <guid isPermaLink="true">${url(paths.note(n.slug, locale))}</guid>
      <pubDate>${new Date(`${n.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate>
      <description>${escape(summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(t.feed.title)}</title>
    <link>${url(paths.notes(locale))}</link>
    <atom:link href="${url(paths.notesFeed(locale))}" rel="self" type="application/rss+xml" />
    <description>${escape(t.feed.description)}</description>
    <language>${htmlLang[locale]}</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
