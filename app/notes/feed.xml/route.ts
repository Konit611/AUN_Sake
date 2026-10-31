import { getBrand, getFood, getNotes } from "@/lib/data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// ペアリングノートの RSS 2.0。週 1 回の更新を購読できるように
const LIMIT = 20;

function escape(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function GET() {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const notes = getNotes().slice(0, LIMIT);

  const items = notes
    .map((n) => {
      const summary =
        n.lead ?? `${getBrand(n.brandSlug)!.name} × ${getFood(n.foodSlug)!.name}${n.quote ? `。${n.quote}` : ""}`;
      return `    <item>
      <title>${escape(n.title)}</title>
      <link>${url(`/notes/${n.slug}`)}</link>
      <guid isPermaLink="true">${url(`/notes/${n.slug}`)}</guid>
      <pubDate>${new Date(`${n.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate>
      <description>${escape(summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${SITE_NAME} ペアリングノート`)}</title>
    <link>${url("/notes")}</link>
    <atom:link href="${url("/notes/feed.xml")}" rel="self" type="application/rss+xml" />
    <description>一本の酒と一皿の肴を合わせてみた記録。</description>
    <language>ja</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
