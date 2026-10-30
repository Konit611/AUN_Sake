import type { MetadataRoute } from "next";
import { getBrands, getBrandsBySubCategory, getNotes, getSubCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const notes = getNotes();

  return [
    { url: url("/"), lastModified: notes[0]?.publishedAt },
    { url: url("/notes"), lastModified: notes[0]?.publishedAt },
    ...getSubCategories()
      .filter((s) => getBrandsBySubCategory(s.id).length > 0)
      .map((s) => ({ url: url(`/categories/${s.id}`) })),
    ...getBrands().map((b) => ({ url: url(`/brands/${b.slug}`) })),
    ...notes.map((n) => ({ url: url(`/notes/${n.slug}`), lastModified: n.publishedAt })),
  ];
}
