"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  EMPTY_FILTERS,
  filterBrands,
  filtersToSearch,
  parseFilters,
  type BrandFilters,
} from "@/lib/brand-filter";
import { normalize } from "@/lib/search";
import type { CategoryId, FoodGenre, TasteKeyword } from "@/lib/types";
import { FOOD_GENRES, TASTE_KEYWORDS } from "@/lib/types";
import { Glyph } from "./ui";

/** 全銘柄ぶんクライアントに渡るので、表示と絞り込みに要るものだけにする */
export type ExplorerBrand = {
  slug: string;
  name: string;
  kana?: string;
  kind: CategoryId;
  sub: string;
  subKana?: string;
  maker: string;
  region: string;
  tastes: TasteKeyword[];
  genres: FoodGenre[];
  /** いちばん息が合う肴 */
  pair?: string;
};

export type ExplorerKind = { id: CategoryId; name: string; kana?: string };

// 一度に描画するカードの数。「もっと見る」でこの数ずつ足す
const PAGE_SIZE = 24;

// 条件は URL（?q=&kind=&taste=&food=）が正。サーバーでは常に条件なし＝全銘柄を描画して HTML に一覧を残す
const URL_CHANGE = "aun:brands-filter";
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_CHANGE, onChange);
  };
}

// 写真が入るまでの、種類ごとの色とシルエット
const KIND_LOOK: Record<CategoryId, { bg: string; stroke: string; path: React.ReactNode }> = {
  shochu: {
    bg: "#22384A",
    stroke: "#6F879B",
    path: (
      <>
        <path d="M13 2h6v10c0 2 5 4 5 9v31a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V21c0-5 5-7 5-9z" />
        <path d="M8 30h16v12H8z" />
      </>
    ),
  },
  beer: {
    bg: "#3A3528",
    stroke: "#8E8466",
    path: (
      <>
        <path d="M6 12h20l-2 40H8z" />
        <path d="M6 12c1-4 5-5 7-3 2-3 7-3 9 0 2-1 5 0 4 3" />
        <path d="M7 24h18" />
      </>
    ),
  },
  sake: {
    bg: "#263347",
    stroke: "#6F879B",
    path: (
      <>
        <path d="M13 4h6l-1 6c6 4 8 10 8 20 0 12-4 22-10 22S6 42 6 30c0-10 2-16 8-20z" />
        <path d="M12 4h8" />
      </>
    ),
  },
  wine: {
    bg: "#3A2834",
    stroke: "#9A7A8C",
    path: (
      <>
        <path d="M8 4h16c1 10-1 18-8 19-7-1-9-9-8-19z" />
        <path d="M8.5 12h15" />
        <path d="M16 23v26" />
        <path d="M10 52h12" />
      </>
    ),
  },
};

const chip = "flex-none cursor-pointer rounded-full border-2 px-4 text-sm whitespace-nowrap min-h-11 md:min-h-10 md:px-3.5";
const chipOn = "border-accent bg-accent font-bold text-bg";
const chipOff = "border-line-strong bg-transparent font-medium text-fg hover:border-subtle";

function ChipGroup({
  label,
  items,
  value,
  onPick,
  className = "",
}: {
  label: string;
  items: { id: string; name: string }[];
  value: string;
  onPick: (id: string) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`flex gap-1.5 ${className}`}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(it.id)}
            className={`${chip} ${on ? chipOn : chipOff}`}
          >
            {it.name}
          </button>
        );
      })}
    </div>
  );
}

export function BrandExplorer({ brands, kinds }: { brands: ExplorerBrand[]; kinds: ExplorerKind[] }) {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const kindIds = useMemo(() => kinds.map((k) => k.id), [kinds]);
  const f = parseFilters(search, kindIds);

  const kindById = useMemo(() => new Map(kinds.map((k) => [k.id, k])), [kinds]);
  // 検索対象：名前・よみ・蔵元・産地・分類（サーバーから送らずにここで一度だけ作る）
  const haystacks = useMemo(
    () =>
      new Map(
        brands.map((b) => {
          const kind = kindById.get(b.kind);
          const parts = [b.name, b.kana, b.maker, b.region, b.sub, b.subKana, kind?.name, kind?.kana];
          return [b.slug, normalize(parts.filter(Boolean).join(" "))];
        }),
      ),
    [brands, kindById],
  );
  // 条件が変わったら先頭から
  const [page, setPage] = useState({ search, shown: PAGE_SIZE });
  const shown = page.search === search ? page.shown : PAGE_SIZE;
  const [filterOpen, setFilterOpen] = useState(false);

  const update = (patch: Partial<BrandFilters>) => {
    // 履歴は積まずに URL を書き換えて、購読側に知らせる
    const next = filtersToSearch({ ...f, ...patch });
    window.history.replaceState(null, "", `${window.location.pathname}${next}`);
    window.dispatchEvent(new Event(URL_CHANGE));
  };
  // 味わい・肴はもう一度押すと解除
  const toggle = (key: "taste" | "food", id: string) => update({ [key]: f[key] === id ? "" : id });

  const results = filterBrands(brands, f, (b) => haystacks.get(b.slug)!);

  const kindItems = [{ id: "all", name: "すべて" }, ...kinds];
  const tasteItems = TASTE_KEYWORDS.map((t) => ({ id: t, name: t }));
  const foodItems = FOOD_GENRES.map((g) => ({ id: g, name: g }));
  const active = (f.taste ? 1 : 0) + (f.food ? 1 : 0);

  const refine = (
    <>
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] font-bold md:text-sm">味わい</p>
        <ChipGroup label="味わい" items={tasteItems} value={f.taste} onPick={(id) => toggle("taste", id)} className="flex-wrap" />
      </div>
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] font-bold md:text-sm">合わせたい肴</p>
        <ChipGroup label="合わせたい肴" items={foodItems} value={f.food} onPick={(id) => toggle("food", id)} className="flex-wrap" />
      </div>
      <button
        type="button"
        onClick={() => update(EMPTY_FILTERS)}
        className="min-h-11 cursor-pointer rounded-xl border border-line-strong text-sm text-muted hover:text-fg"
      >
        条件をクリア
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="px-5 md:px-0">
        <label htmlFor="brand-q" className="sr-only">
          銘柄名・蔵元・産地で検索
        </label>
        <div className="relative">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted md:left-5 md:size-[22px]"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            id="brand-q"
            type="search"
            autoComplete="off"
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="銘柄名・蔵元・産地で検索（例：獺祭、新潟、麦）"
            className="min-h-[52px] w-full rounded-[14px] border-2 border-line-strong bg-surface pl-[46px] pr-4 text-base text-fg placeholder:text-subtle focus:border-accent focus:outline-none md:min-h-[60px] md:rounded-2xl md:pl-14 md:text-[17px] [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
      </form>

      {/* モバイル：種類は横スクロール */}
      <ChipGroup
        label="お酒の種類"
        items={kindItems}
        value={f.kind}
        onPick={(id) => update({ kind: id })}
        className="gap-2 overflow-x-auto px-5 pb-1 md:hidden"
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        {/* PC：左の絞り込み */}
        <aside
          aria-label="絞り込み"
          className="hidden w-[240px] flex-none flex-col gap-6 rounded-[20px] border border-line bg-surface p-[22px] md:flex"
        >
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold">種類</p>
            <ChipGroup label="お酒の種類" items={kindItems} value={f.kind} onPick={(id) => update({ kind: id })} className="flex-wrap" />
          </div>
          {refine}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-0">
            <p aria-live="polite" className="text-sm text-muted md:text-[15px]">
              <strong className="text-lg text-fg md:text-xl">{results.length}</strong> 銘柄
            </p>
            <p className="hidden text-[13px] text-subtle md:block">
              カードの「吽」は、AUN編集部がいちばん息が合うと考える肴です。
            </p>
            <button
              type="button"
              aria-expanded={filterOpen}
              aria-controls="brand-filters-mobile"
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-strong px-3.5 text-sm font-bold text-fg md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              {active ? `絞り込み（${active}）` : "絞り込み"}
            </button>
          </div>

          {/* モバイル：「絞り込み」で開閉 */}
          {filterOpen && (
            <div
              id="brand-filters-mobile"
              className="mx-5 flex flex-col gap-[18px] rounded-2xl border border-line bg-surface p-[18px] md:hidden"
            >
              {refine}
            </div>
          )}

          {results.length === 0 ? (
            <div className="mx-5 flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-line-dashed px-5 py-9 text-center md:mx-0 md:gap-3 md:rounded-[20px] md:py-12">
              <Glyph char="吽" className="text-[40px] text-line-dashed md:text-5xl" />
              <p className="text-base font-bold md:text-[17px]">条件に合う銘柄が見つかりませんでした</p>
              <p className="text-[13px] text-muted md:text-sm">
                キーワードを短くするか、条件を減らしてみてください。
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 px-5 md:grid md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-4 md:px-0">
              {results.slice(0, shown).map((b) => (
                <li key={b.slug}>
                  <BrandCard b={b} kindName={kindById.get(b.kind)?.name ?? ""} />
                </li>
              ))}
            </ul>
          )}
          {results.length > shown && (
            <button
              type="button"
              onClick={() => setPage({ search, shown: shown + PAGE_SIZE })}
              className="mx-auto flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line-strong px-6 text-[15px] font-bold text-fg hover:border-subtle"
            >
              もっと見る（残り{results.length - shown}）
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BrandCard({ b, kindName }: { b: ExplorerBrand; kindName: string }) {
  const look = KIND_LOOK[b.kind];
  return (
    <Link
      href={`/brands/${b.slug}`}
      className="flex h-full overflow-hidden rounded-2xl border border-line bg-surface text-fg hover:border-line-strong md:flex-col md:rounded-[18px]"
    >
      <div
        role="img"
        aria-label={`${b.name}の写真（準備中）`}
        style={{ background: look.bg }}
        className="relative flex min-h-[124px] flex-[0_0_96px] items-center justify-center md:h-[180px] md:min-h-0 md:flex-none"
      >
        <svg
          viewBox="0 0 32 56"
          fill="none"
          stroke={look.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          aria-hidden="true"
          className="h-14 w-8 md:h-[106px] md:w-[60px]"
        >
          {look.path}
        </svg>
        <span className="absolute bottom-2.5 left-3.5 hidden text-xs text-muted md:block">
          [写真：{b.name}]
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3 md:gap-3 md:px-5 md:pb-5 md:pt-[18px]">
        <p className="text-[11px] text-muted md:hidden">
          {kindName} ・ {b.sub} ・ {b.region}
        </p>
        <div className="hidden items-center justify-between gap-2 md:flex">
          <span className="rounded-full border border-line-strong px-2.5 py-[3px] text-xs text-fg-2">
            {kindName} ・ {b.sub}
          </span>
          <span className="text-xs text-subtle">{b.region}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[17px] font-black leading-[1.4] md:text-[21px]">{b.name}</p>
          <p className="text-xs text-subtle md:hidden">
            {b.maker} ・ {b.tastes.join("・")}
          </p>
          <p className="hidden text-[13px] text-muted md:block">{b.maker}</p>
        </div>
        <p className="hidden text-sm text-fg-2 md:block">{b.tastes.join(" ・ ")}</p>
        {b.pair && (
          <p className="mt-1.5 flex items-center gap-2 text-sm font-bold md:mt-auto md:gap-3 md:rounded-xl md:border md:border-accent md:bg-bg md:px-3.5 md:py-3 md:text-[15px]">
            <Glyph char="吽" className="text-xl text-accent md:text-[26px]" />
            {b.pair}
          </p>
        )}
      </div>
    </Link>
  );
}
