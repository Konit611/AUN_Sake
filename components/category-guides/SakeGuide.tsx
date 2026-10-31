import { sakeGrades, sakeTypes, type SakeType } from "@/content/sake-guide";
import { Glyph } from "../ui";

/** 日本酒の専用ガイド：香味の4タイプ（2×2）と特定名称の早見表。中身は content/sake-guide.ts */
export function SakeGuide() {
  return (
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
  );
}

function SakeTypeCell({ type, rowLabel }: { type: SakeType; rowLabel: boolean }) {
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
