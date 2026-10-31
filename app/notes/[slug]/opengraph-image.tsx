import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { defaultLocale, getDictionary } from "@/lib/i18n";
import { fitFontSize, og, OgFrame, ogContentType, ogFonts, OgGlyph, ogSize } from "@/lib/og";
import { getBrand, getFood, getNote, getNotes } from "@/lib/data";

const locale = defaultLocale;
const t = getDictionary(locale);

export const alt = t.og.noteAlt;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getNotes().map((n) => ({ slug: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const brand = getBrand(note.brandSlug)!;
  const food = getFood(note.foodSlug)!;

  return new ImageResponse(
    (
      <OgFrame locale={locale}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 26, color: og.accent, letterSpacing: "0.2em" }}>
            PAIRING NOTE
          </div>
          <div style={{ display: "flex", fontSize: fitFontSize(note.title, 68, 48, 1500), lineHeight: 1.4 }}>
            {note.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, color: og.muted }}>
            <OgGlyph char="阿" size={44} color={og.fg} />
            {brand.name}
            <div style={{ display: "flex", margin: "0 8px" }}>×</div>
            <OgGlyph char="吽" size={44} color={og.accent} />
            {food.name}
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: ogFonts },
  );
}
