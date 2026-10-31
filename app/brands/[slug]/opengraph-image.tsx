import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { fitFontSize, og, OgFrame, ogContentType, ogFonts, OgGlyph, ogSize } from "@/lib/og";
import { getBrand, getBrands, getFood, getPairings, getSubCategory } from "@/lib/data";
import { PAIRING_LEVELS } from "@/lib/types";

export const alt = "AUN の銘柄と、息の合う肴";
export const size = ogSize;
export const contentType = ogContentType;

// ページと同じ銘柄をビルド時に画像化する
export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const sub = getSubCategory(brand.subCategoryId)!;
  const best = getPairings(brand.slug)[0];
  const food = best && getFood(best.foodSlug)!;

  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 28, color: og.muted, letterSpacing: "0.1em" }}>
            {sub.name} ・ {brand.maker}（{brand.region}）
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <OgGlyph char="阿" size={96} color={og.fg} />
            <div style={{ display: "flex", fontSize: fitFontSize(brand.name, 104, 48, 900), lineHeight: 1.15 }}>
              {brand.name}
            </div>
          </div>
          {food && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "20px 28px",
                border: `3px solid ${og.accent}`,
                borderRadius: 20,
                alignSelf: "flex-start",
              }}
            >
              <OgGlyph char="吽" size={64} color={og.accent} />
              <div
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  borderRadius: 10,
                  background: og.accent,
                  color: og.bg,
                  fontSize: 26,
                }}
              >
                {PAIRING_LEVELS[best.level].label}
              </div>
              <div style={{ display: "flex", fontSize: 48 }}>{food.name}</div>
            </div>
          )}
        </div>
      </OgFrame>
    ),
    { ...size, fonts: ogFonts },
  );
}
