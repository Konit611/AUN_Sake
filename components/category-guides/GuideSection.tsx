import type { ReactNode } from "react";
import type { Category } from "@/lib/types";
import { Glyph } from "../ui";

// モバイルはヘッダー（61px）の下に分類タブ（49px）が固定されるので、その分ずらして止める
export const anchorOffset = "scroll-mt-[118px] md:scroll-mt-6";

/** 「お酒の分類」の大分類ひとつぶん。見出し（飾り文字・名前・説明）＋中身 */
export function GuideSection({
  category,
  last = false,
  children,
}: {
  category: Category;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={category.id} className={`border-t border-line ${anchorOffset}`}>
      <div
        className={`mx-auto flex max-w-[1200px] flex-col gap-4 px-5 pt-8 md:gap-7 md:px-6 md:pt-16 ${
          last ? "pb-10 md:pb-20" : "pb-8 md:pb-16"
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-6">
          <div className="flex items-center gap-3.5 md:gap-5">
            <Glyph char={category.glyph} className="text-[56px] text-accent md:text-[80px]" />
            <div className="flex flex-col gap-0.5 md:gap-1">
              <span className="text-[11px] tracking-[0.2em] text-subtle md:text-[13px]">{category.nameEn}</span>
              <h2 className="text-[26px] font-black md:text-4xl">{category.name}</h2>
            </div>
          </div>
          <p className="text-sm leading-[1.85] text-muted md:max-w-[560px] md:flex-[1_1_420px] md:text-base md:leading-[1.9]">
            {category.lead}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
