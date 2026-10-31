import type { MetadataRoute } from "next";
import {
  getBrands,
  getCategoriesWithBrands,
  getFoodsWithPairings,
  getNotes,
  getSubCategoriesWithBrands,
} from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const notes = getNotes();

  return [
    { url: url("/"), lastModified: notes[0]?.publishedAt },
    { url: url("/notes"), lastModified: notes[0]?.publishedAt },
    { url: url("/brands") },
    { url: url("/categories") },
    { url: url("/foods") },
    ...getCategoriesWithBrands().map((c) => ({ url: url(`/categories/${c.id}`) })),
    ...getSubCategoriesWithBrands().map((s) => ({ url: url(`/categories/${s.id}`) })),
    ...getBrands().map((b) => ({ url: url(`/brands/${b.slug}`) })),
    ...getFoodsWithPairings().map((f) => ({ url: url(`/foods/${f.slug}`) })),
    ...notes.map((n) => ({ url: url(`/notes/${n.slug}`), lastModified: n.publishedAt })),
  ];
}
