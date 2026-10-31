import Link from "next/link";
import { getBrandsBySubCategory, getSubCategories } from "@/lib/data";
import type { Category } from "@/lib/types";
import { Glyph } from "../ui";
import { anchorOffset } from "./GuideSection";

// 小分類カードに並べる銘柄の数。残りは小分類ページへ
const CHIP_LIMIT = 8;

/** guide: "subcategories" の大分類。小分類ごとに 産地など・特徴（阿）・合う料理（吽）・銘柄 */
export function SubcategoryGuide({ category }: { category: Category }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(330px,1fr))] md:gap-4">
      {getSubCategories(category.id).map((s) => {
        const all = getBrandsBySubCategory(s.id);
        const brands = all.slice(0, CHIP_LIMIT);
        // 代表銘柄の例は、空いている枠にだけ出す
        const examples = (s.examples ?? []).slice(0, Math.max(0, CHIP_LIMIT - brands.length));
        return (
          <div
            key={s.id}
            id={s.id}
            className={`flex flex-col gap-3 rounded-2xl border border-line bg-surface p-[18px] md:gap-3.5 md:rounded-[18px] md:p-[22px] ${anchorOffset}`}
          >
            <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-3">
              <h3 className="text-[19px] font-black md:flex-none md:whitespace-nowrap md:text-[22px]">{s.name}</h3>
              {s.meta && <span className="text-xs text-subtle md:text-right">{s.meta}</span>}
            </div>
            {s.taste && (
              <p className="flex items-start gap-2.5 text-sm leading-[1.75] text-fg-2 md:text-[15px]">
                <Glyph char="阿" className="text-xl leading-[1.3] text-fg md:text-[22px] md:leading-[1.2]" />
                {s.taste}
              </p>
            )}
            {s.pair && (
              <p className="flex items-start gap-2.5 rounded-xl border border-accent bg-bg px-3 py-2.5 text-sm leading-[1.75] md:px-3.5 md:py-3 md:text-[15px]">
                <Glyph char="吽" className="text-xl leading-[1.3] text-accent md:text-[22px] md:leading-[1.2]" />
                {s.pair}
              </p>
            )}
            {brands.length + examples.length > 0 && (
              <ul aria-label={`${s.name}の銘柄`} className="flex gap-1.5 overflow-x-auto md:flex-wrap md:overflow-visible">
                {brands.map((b) => (
                  <li key={b.slug} className="flex-none">
                    <Link
                      href={`/brands/${b.slug}`}
                      className="flex min-h-9 items-center whitespace-nowrap rounded-full border border-line-strong px-3 text-[13px] text-fg-2 hover:border-subtle hover:text-fg"
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
                {all.length > brands.length && (
                  <li className="flex-none">
                    <Link
                      href={`/categories/${s.id}`}
                      className="flex min-h-9 items-center whitespace-nowrap rounded-full border border-dashed border-line-strong px-3 text-[13px] font-bold text-accent hover:border-accent"
                    >
                      すべて（{all.length}）→
                    </Link>
                  </li>
                )}
                {/* 銘柄ページがまだない代表銘柄はリンクなし */}
                {examples.map((name) => (
                  <li
                    key={name}
                    className="flex min-h-9 flex-none items-center whitespace-nowrap rounded-full border border-dashed border-line px-3 text-[13px] text-subtle"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
