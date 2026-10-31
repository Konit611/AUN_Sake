import type { Metadata } from "next";
import Link from "next/link";
import { Glyph } from "@/components/ui";
import { sakeGrades, sakeTypes } from "@/content/sake-guide";
import { getBrandsBySubCategory, getCategories, getSubCategories } from "@/lib/data";
import { pageMetadata } from "@/lib/site";
import type { Category } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "お酒の分類",
  description: "銘柄を知らなくても、分類がわかれば肴は選べます。それぞれの分類の特徴と、基本の合わせ方をまとめました。",
  path: "/categories",
});

// モバイルはヘッダー（61px）の下に分類タブ（49px）が固定されるので、その分ずらして止める
const anchorOffset = "scroll-mt-[118px] md:scroll-mt-6";

function GroupHeading({ category }: { category: Category }) {
  return (
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
  );
}

export default function CategoriesPage() {
  const all = getCategories();
  // 日本酒は香味の4タイプで別枠にして最後に置く
  const groups = all.filter((c) => c.id !== "sake");
  const sake = all.find((c) => c.id === "sake")!;
  const jump = [...groups, sake].map((c) => ({
    ...c,
    meta: c.id === "sake" ? "香味の4タイプ" : `${getSubCategories(c.id).length}分類`,
  }));

  return (
    <div className="flex flex-col">
      {/* モバイル：分類タブをヘッダーの下に固定 */}
      <nav
        aria-label="分類へ移動"
        className="sticky top-[61px] z-10 grid grid-cols-4 border-b border-line bg-bg md:hidden"
      >
        {jump.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="flex min-h-12 items-center justify-center gap-1.5 text-sm font-bold text-fg"
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
                  {c.nameEn} ・ {c.meta}
                </span>
              </span>
            </a>
          ))}
        </nav>
      </section>

      {groups.map((c) => (
        <section key={c.id} id={c.id} className={`border-t border-line ${anchorOffset}`}>
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-8 md:gap-7 md:px-6 md:py-16">
            <GroupHeading category={c} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(330px,1fr))] md:gap-4">
              {getSubCategories(c.id).map((s) => {
                const brands = getBrandsBySubCategory(s.id);
                const examples = s.examples ?? [];
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
          </div>
        </section>
      ))}

      {/* 日本酒：香味の4タイプ＋特定名称の早見表 */}
      <section id={sake.id} className={`border-t border-line ${anchorOffset}`}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 pb-10 pt-8 md:gap-7 md:px-6 md:pb-20 md:pt-16">
          <GroupHeading category={sake} />
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-stretch md:gap-6">
            <div className="grid grid-cols-2 gap-2 md:flex-[1_1_520px] md:grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)] md:gap-2.5">
              <span aria-hidden="true" className="hidden md:block" />
              <span className="text-center text-[11px] text-subtle md:text-xs">
                <span className="hidden md:inline">味わい </span>軽快・淡麗
              </span>
              <span className="text-center text-[11px] text-subtle md:text-xs">
                <span className="hidden md:inline">味わい </span>濃醇・コク
              </span>
              {sakeTypes.map((t, i) => (
                <SakeTypeCell key={t.name} type={t} rowLabel={i % 2 === 0} />
              ))}
            </div>

            <div className="mt-2 overflow-x-auto rounded-[14px] border border-line md:mt-0 md:flex-[1_1_360px] md:rounded-2xl">
              <table className="w-full border-collapse text-[13px] md:min-w-[340px] md:text-sm">
                <caption className="px-3.5 pb-2 pt-3.5 text-left text-sm font-bold text-fg md:px-[18px] md:pt-4 md:text-[15px]">
                  特定名称の早見表
                </caption>
                <thead>
                  <tr className="bg-surface text-left text-muted">
                    <th scope="col" className="px-3.5 py-2.5 font-medium md:px-[18px] md:py-3">名称</th>
                    <th scope="col" className="px-2 py-2.5 font-medium md:px-[18px] md:py-3">精米歩合</th>
                    <th scope="col" className="py-2.5 pl-2 pr-3.5 font-medium md:px-[18px] md:py-3">醸造アルコール</th>
                  </tr>
                </thead>
                <tbody>
                  {sakeGrades.map((g) => (
                    <tr key={g.name} className="border-t border-line">
                      <th scope="row" className="px-3.5 py-2.5 text-left font-bold md:px-[18px] md:py-3">{g.name}</th>
                      <td className="px-2 py-2.5 text-fg-2 md:px-[18px] md:py-3">{g.polish}</td>
                      <td className="py-2.5 pl-2 pr-3.5 text-fg-2 md:px-[18px] md:py-3">{g.alcohol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SakeTypeCell({ type, rowLabel }: { type: (typeof sakeTypes)[number]; rowLabel: boolean }) {
  return (
    <>
      {/* PC：行の見出し（香り）は縦書きで左に */}
      {rowLabel && (
        <span className="hidden text-center text-xs text-subtle [writing-mode:vertical-rl] md:block">
          香り {type.aroma}
        </span>
      )}
      <div className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-surface p-3.5 md:gap-2 md:rounded-2xl md:p-[18px]">
        <span className="text-[10px] tracking-[0.1em] text-subtle md:hidden">香り {type.aroma}</span>
        <p className="text-lg font-black md:text-[22px]">
          {type.name} <span className="text-[13px] font-medium text-muted">{type.kana}</span>
        </p>
        <p className="text-xs leading-[1.6] text-muted md:text-[13px]">{type.desc}</p>
        <p className="text-[13px] leading-[1.6] md:text-sm md:leading-[1.7]">
          <Glyph char="吽" className="text-accent" /> {type.pair}
        </p>
      </div>
    </>
  );
}
