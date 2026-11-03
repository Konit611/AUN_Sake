import { ImageResponse } from "next/og";
import { og, OgFrame, ogContentType, ogFonts, OgGlyph, ogSize } from "@/lib/og";
import { defaultLocale, getDictionary } from "@/lib/i18n";

const locale = defaultLocale;
const t = getDictionary(locale);

export const alt = t.site.title;
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame locale={locale}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 88, lineHeight: 1.3 }}>
            <div style={{ display: "flex" }}>{t.home.titleLine1}</div>
            <div style={{ display: "flex" }}>{t.home.titleLine2}</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 190,
                height: 240,
                border: `3px solid ${og.lineStrong}`,
                borderRadius: "100px 100px 22px 22px",
              }}
            >
              <OgGlyph char="阿" size={120} color={og.fg} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 190,
                height: 240,
                background: og.accent,
                borderRadius: "100px 100px 22px 22px",
              }}
            >
              <OgGlyph char="吽" size={120} color={og.bg} />
            </div>
          </div>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: ogFonts },
  );
}
