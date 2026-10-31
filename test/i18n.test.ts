import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { format, getDictionary, locales } from "@/lib/i18n";
import { ja } from "@/lib/i18n/dictionaries/ja";
import { localize } from "@/lib/i18n/localized";
import { localePath, paths } from "@/lib/routes";

// 画面の文言は lib/i18n の辞書に置く。app/・components/ に日本語を直接書いたら落ちる
describe("画面の文言は辞書にある", () => {
  const roots = ["app", "components", "lib/og.tsx"];
  const files = roots.flatMap((r) => walk(join(process.cwd(), r))).filter((f) => /\.(ts|tsx)$/.test(f) && !f.endsWith(".test.ts"));
  // 「阿」「吽」は飾り文字（ロゴ）なので訳さない
  const japanese = /[぀-ヿ一-鿿]/;
  const glyphOnly = /[阿吽]/g;

  it.each(files.map((f) => [f.replace(`${process.cwd()}/`, ""), f]))("%s", (_, file) => {
    const offending = readFileSync(file, "utf8")
      .split("\n")
      .map((line, i) => ({ line: line.trim(), no: i + 1 }))
      .filter(({ line }) => !/^(\/\/|\*|\/\*|\{\/\*)/.test(line)) // コメント
      .filter(({ line }) => !line.includes("throw new Error(")) // 開発者向けのエラー
      .filter(({ line }) => japanese.test(line.replace(glyphOnly, "")));
    expect(offending.map(({ no, line }) => `${no}: ${line}`)).toEqual([]);
  });
});

describe("辞書", () => {
  it("どの言語にも辞書がある", () => {
    for (const l of locales) expect(getDictionary(l)).toBeDefined();
  });

  it("format は {key} を埋め、知らないキーは残す", () => {
    expect(format("{name}に合うお酒", { name: "角煮" })).toBe("角煮に合うお酒");
    expect(format("{a}と{b}", { a: "x" })).toBe("xと{b}");
  });

  it("辞書の値はすべて文字列（クライアントにそのまま渡せる）", () => {
    const check = (v: unknown, path: string) => {
      if (typeof v === "string") return;
      expect(typeof v, path).toBe("object");
      for (const [k, x] of Object.entries(v as object)) check(x, `${path}.${k}`);
    };
    check(ja, "ja");
  });
});

describe("localize", () => {
  it("そのまま書いた値は既定の言語として扱う", () => {
    expect(localize("黒霧島", "ja")).toBe("黒霧島");
    expect(localize(["甘み"], "ja")).toEqual(["甘み"]);
  });

  it("{ ja } の形から言語の値を取り出す", () => {
    expect(localize({ ja: "角煮" }, "ja")).toBe("角煮");
  });
});

describe("paths", () => {
  it("既定の言語は接頭辞なし", () => {
    expect(paths.brand("maou")).toBe("/brands/maou");
    expect(paths.categories(undefined, "sake")).toBe("/categories#sake");
    expect(paths.search(undefined, "黒 霧島")).toBe("/search?q=%E9%BB%92%20%E9%9C%A7%E5%B3%B6");
    expect(localePath("/")).toBe("/");
  });
});

function walk(path: string): string[] {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => walk(join(path, name)));
}
