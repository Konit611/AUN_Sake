import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { colors } from "@/lib/tokens";

// globals.css（Tailwind のテーマ）と lib/tokens.ts（OGP 画像など）の色がずれていないか
describe("色のトークン", () => {
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
  const fromCss = Object.fromEntries(
    [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{3,8});/gi)].map((m) => [m[1], m[2].toLowerCase()]),
  );

  it("globals.css の色がすべて lib/tokens.ts にある", () => {
    expect(Object.keys(fromCss).sort()).toEqual(Object.keys(colors).sort());
  });

  it("値が同じ", () => {
    expect(fromCss).toEqual(colors);
  });
});
