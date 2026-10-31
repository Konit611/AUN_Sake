import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { colors } from "./tokens";

// OGP 画像（next/og の ImageResponse）用の共通部品。
// ImageResponse は woff2 を読めないので TTF を assets/fonts に置いている（OFL）。
// Zen Antique は「阿」「吽」だけのサブセット。

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// 描画中に読むとリクエストごとの処理扱いになり静的生成されないので、モジュール読み込み時に一度だけ読む
const [kaku, antique] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/ZenKakuGothicNew-Bold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/ZenAntique-AUN-subset.ttf")),
]);

export const ogFonts = [
  { name: "Zen Kaku Gothic New", data: kaku, weight: 700 as const, style: "normal" as const },
  { name: "Zen Antique", data: antique, weight: 400 as const, style: "normal" as const },
];

// ImageResponse では CSS 変数が使えないので、globals.css と同じ値を lib/tokens.ts から
export const og = {
  bg: colors.bg,
  surface: colors.surface,
  line: colors.line,
  lineStrong: colors["line-strong"],
  fg: colors.fg,
  muted: colors.muted,
  subtle: colors.subtle,
  accent: colors.accent,
};

export function OgGlyph({ char, size, color }: { char: "阿" | "吽"; size: number; color: string }) {
  return (
    <div style={{ display: "flex", fontFamily: "Zen Antique", fontSize: size, lineHeight: 1, color }}>
      {char}
    </div>
  );
}

/** 上にロゴ、下にキャッチ。中身は children */
export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px",
        background: og.bg,
        color: og.fg,
        fontFamily: "Zen Kaku Gothic New",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width="66" height="36" viewBox="0 0 44 24" fill="none">
          <circle
            cx="11"
            cy="12"
            r="9"
            stroke={og.accent}
            strokeWidth="2.5"
            strokeDasharray="48 9"
            transform="rotate(-20 11 12)"
          />
          <circle cx="33" cy="12" r="10" fill={og.accent} />
        </svg>
        <div style={{ display: "flex", fontSize: 38, letterSpacing: "0.18em" }}>AUN</div>
      </div>

      {children}

      <div
        style={{
          display: "flex",
          borderTop: `2px solid ${og.line}`,
          paddingTop: 24,
          fontSize: 24,
          color: og.subtle,
        }}
      >
        <div style={{ display: "flex", color: og.accent, letterSpacing: "0.2em" }}>酒と肴の、阿吽の呼吸。</div>
      </div>
    </div>
  );
}

/** 文字数に合わせて見出しを縮める */
export function fitFontSize(text: string, max: number, min: number, perChar: number): number {
  return Math.max(min, Math.min(max, Math.floor(perChar / Math.max(text.length, 1))));
}
