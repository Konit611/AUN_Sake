/**
 * app/globals.css の @theme（--color-*）と同じ値。CSS 変数が使えない所（OGP 画像など）用。
 * 片方だけ変えると test/tokens.test.ts が落ちる。
 */
export const colors = {
  bg: "#13202c",
  surface: "#172735",
  raised: "#22384a",
  track: "#2c4255",
  line: "#253747",
  "line-strong": "#3a5163",
  "line-dashed": "#4d6577",
  fg: "#edeff1",
  "fg-2": "#cfd7de",
  muted: "#afbac5",
  subtle: "#8e9ca9",
  accent: "#f2876c",
  "accent-soft": "#ffb39f",
  mint: "#7cc4b2",
  "mint-fg": "#9ed8c9",
} as const;
