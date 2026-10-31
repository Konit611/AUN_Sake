import type { MetadataRoute } from "next";
import {
  getBrands,
  getCategoriesWithBrands,
  getFoodsWithPairings,
  getNotes,
  getSubCategoriesWithBrands,
} from "@/lib/data";
import { paths } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  const notes = getNotes();

  return [
    { url: url(paths.home()), lastModified: notes[0]?.publishedAt },
    { url: url(paths.notes()), lastModified: notes[0]?.publishedAt },
    { url: url(paths.brands()) },
    { url: url(paths.categories()) },
    { url: url(paths.foods()) },
    ...getCategoriesWithBrands().map((c) => ({ url: url(paths.category(c.id)) })),
    ...getSubCategoriesWithBrands().map((s) => ({ url: url(paths.category(s.id)) })),
    ...getBrands().map((b) => ({ url: url(paths.brand(b.slug)) })),
    ...getFoodsWithPairings().map((f) => ({ url: url(paths.food(f.slug)) })),
    ...notes.map((n) => ({ url: url(paths.note(n.slug)), lastModified: n.publishedAt })),
  ];
}
