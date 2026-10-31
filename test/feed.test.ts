import { describe, expect, it } from "vitest";
import { GET } from "@/app/notes/feed.xml/route";
import { getNotes } from "@/lib/data";

describe("/notes/feed.xml", () => {
  it("RSS 2.0 として、公開中のノートを新しい順に出す", async () => {
    const res = await GET();
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    const xml = await res.text();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    const links = [...xml.matchAll(/<item>\s*<title>[^<]*<\/title>\s*<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    expect(links.map((l) => l.split("/notes/")[1])).toEqual((await getNotes()).slice(0, 20).map((n) => n.slug));
  });

  it("本文中の & < > はエスケープされる", async () => {
    const xml = await (await GET()).text();
    const bodies = [...xml.matchAll(/<(title|description)>([^<]*)<\/\1>/g)].map((m) => m[2]);
    for (const b of bodies) expect(b).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
  });
});
