import type { Metadata } from "next";
import type { ComponentType } from "react";
import { GuideSection } from "@/components/category-guides/GuideSection";
import { SakeGuide } from "@/components/category-guides/SakeGuide";
import { SubcategoryGuide } from "@/components/category-guides/SubcategoryGuide";
import { Glyph } from "@/components/ui";
import { getCategories, getSubCategories } from "@/lib/data";
import { pageMetadata } from "@/lib/site";
import type { Category, CategoryId } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "お酒の分類",
  description: "銘柄を知らなくても、分類がわかれば肴は選べます。それぞれの分類の特徴と、基本の合わせ方をまとめました。",
  path: "/categories",
});

/**
 * guide: "custom" の大分類の専用ガイド。大分類を custom にしたらここに登録する
 * （登録がなければビルドが止まる）。summary は上の移動タイルに出す一言。
 */
const CUSTOM_GUIDES: Partial<Record<CategoryId, { summary: string; Guide: ComponentType }>> = {
  sake: { summary: "香味の4タイプ", Guide: SakeGuide },
};

function customGuide(category: Category) {
  const guide = CUSTOM_GUIDES[category.id];
  if (!guide) {
    throw new Error(`大分類 ${category.id} は guide: "custom" ですが、CUSTOM_GUIDES に登録がありません`);
  }
  return guide;
}

export default function CategoriesPage() {
  // 小分類カードで説明するものを先に、専用ガイドのものを後に（デザインどおり日本酒が最後）
  const all = getCategories();
  const ordered = [
    ...all.filter((c) => c.guide === "subcategories"),
    ...all.filter((c) => c.guide === "custom"),
  ];
  const jump = ordered.map((c) => ({
    ...c,
    summary: c.guide === "custom" ? customGuide(c).summary : `${getSubCategories(c.id).length}分類`,
  }));
  // モバイルの固定タブは 5 つまで等分、それ以上は横スクロール
  const tabsFit = jump.length <= 5;

  return (
    <div className="flex flex-col">
      {/* モバイル：分類タブをヘッダーの下に固定 */}
      <nav
        aria-label="分類へ移動"
        style={tabsFit ? { gridTemplateColumns: `repeat(${jump.length}, minmax(0, 1fr))` } : undefined}
        className={`sticky top-[61px] z-10 border-b border-line bg-bg md:hidden ${tabsFit ? "grid" : "flex overflow-x-auto"}`}
      >
        {jump.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={`flex min-h-12 items-center justify-center gap-1.5 text-sm font-bold text-fg ${tabsFit ? "" : "flex-none px-4"}`}
          >
            <Glyph char={c.glyph} className="text-accent" />
            {c.name}
          </a>
        ))}
      </nav>

      <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-7 px-5 pb-7 pt-8 md:px-6 md:pb-10 md:pt-14">
        <div className="flex max-w-[720px] flex-col gap-2.5">
          <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">CATEGORIES</p>
          <h1 className="text-[30px] font-black md:text-[44px]">お酒の分類</h1>
          <p className="text-[15px] leading-[1.9] text-muted md:text-[17px]">
            銘柄を知らなくても、分類がわかれば肴は選べます。それぞれの分類の特徴と、基本の合わせ方をまとめました。
          </p>
        </div>
        <nav aria-label="分類へ移動" className="hidden grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 md:grid">
          {jump.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-[18px] text-fg hover:border-line-strong"
            >
              <Glyph char={c.glyph} className="text-[40px]" />
              <span className="flex flex-col">
                <span className="text-lg font-black">{c.name}</span>
                <span className="text-xs tracking-[0.15em] text-subtle">
                  {c.nameEn} ・ {c.summary}
                </span>
              </span>
            </a>
          ))}
        </nav>
      </section>

      {ordered.map((c, i) => {
        const Guide = c.guide === "custom" ? customGuide(c).Guide : null;
        return (
          <GuideSection key={c.id} category={c} last={i === ordered.length - 1}>
            {Guide ? <Guide /> : <SubcategoryGuide category={c} />}
          </GuideSection>
        );
      })}
    </div>
  );
}
