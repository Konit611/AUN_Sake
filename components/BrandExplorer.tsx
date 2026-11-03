"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  EMPTY_FILTERS,
  filterBrands,
  filtersToSearch,
  parseFilters,
  type BrandFilters,
} from "@/lib/brand-filter";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { normalize } from "@/lib/search";
import type { Category, CategoryId, FoodGenre, TasteKeyword } from "@/lib/types";
import { FOOD_GENRES, TASTE_KEYWORDS } from "@/lib/types";
import { BrandCard, brandGridClass } from "./BrandCard";
import { chipClass, Glyph } from "./ui";

/** 全銘柄ぶんクライアントに渡るので、表示と絞り込みに要るものだけにする */
export type ExplorerBrand = {
  slug: string;
  name: string;
  kana?: string;
  kind: CategoryId;
  sub: string;
  subKana?: string;
  maker: string;
  makerKana?: string;
  region: string;
  regionKana?: string;
  tastes: TasteKeyword[];
  genres: FoodGenre[];
  /** いちばん息が合う肴 */
  pair?: string;
};

export type ExplorerKind = { id: CategoryId; name: string; kana?: string; look: Category["look"] };

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
            className={chipClass(on, "sm")}
          >
            {it.name}
          </button>
        );
      })}
    </div>
  );
}

export function BrandExplorer({
  brands,
  kinds,
  locale,
}: {
  brands: ExplorerBrand[];
  kinds: ExplorerKind[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const tb = t.brandsPage;
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const kindIds = useMemo(() => kinds.map((k) => k.id), [kinds]);
  const f = parseFilters(search, kindIds);

  const kindById = useMemo(() => new Map(kinds.map((k) => [k.id, k])), [kinds]);
  // 検索対象：名前・よみ（関連度で重く見る）と、蔵元・産地・分類（サーバーから送らずにここで一度だけ作る）
  const searchables = useMemo(
    () =>
      new Map(
        brands.map((b) => {
          const kind = kindById.get(b.kind);
          const names = [b.name, b.kana].filter((x): x is string => !!x).map(normalize);
          const others = [b.maker, b.makerKana, b.region, b.regionKana, b.sub, b.subKana, kind?.name, kind?.kana];
          return [b.slug, { names, haystack: normalize([...names, ...others].filter(Boolean).join(" ")) }];
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

  const results = filterBrands(brands, f, (b) => searchables.get(b.slug)!);

  const kindItems = [{ id: "all", name: t.common.all }, ...kinds];
  const tasteItems = TASTE_KEYWORDS.map((id) => ({ id, name: t.tastes[id] }));
  const foodItems = FOOD_GENRES.map((id) => ({ id, name: t.genres[id] }));
  const active = (f.taste ? 1 : 0) + (f.food ? 1 : 0);

  const refine = (
    <>
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] font-bold md:text-sm">{tb.taste}</p>
        <ChipGroup label={tb.taste} items={tasteItems} value={f.taste} onPick={(id) => toggle("taste", id)} className="flex-wrap" />
      </div>
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] font-bold md:text-sm">{tb.food}</p>
        <ChipGroup label={tb.food} items={foodItems} value={f.food} onPick={(id) => toggle("food", id)} className="flex-wrap" />
      </div>
      <button
        type="button"
        onClick={() => update(EMPTY_FILTERS)}
        className="min-h-11 cursor-pointer rounded-xl border border-line-strong text-sm text-muted hover:text-fg"
      >
        {tb.clear}
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="px-5 md:px-0">
        <label htmlFor="brand-q" className="sr-only">
          {tb.searchLabel}
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
            placeholder={tb.searchPlaceholder}
            className="min-h-[52px] w-full rounded-[14px] border-2 border-line-strong bg-surface pl-[46px] pr-4 text-base text-fg placeholder:text-subtle focus:border-accent focus:outline-none md:min-h-[60px] md:rounded-2xl md:pl-14 md:text-[17px] [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
      </form>

      {/* モバイル：種類は横スクロール */}
      <ChipGroup
        label={t.finder.kindGroup}
        items={kindItems}
        value={f.kind}
        onPick={(id) => update({ kind: id })}
        className="gap-2 overflow-x-auto px-5 pb-1 md:hidden"
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        {/* PC：左の絞り込み */}
        <aside
          aria-label={tb.refine}
          className="hidden w-[240px] flex-none flex-col gap-6 rounded-[20px] border border-line bg-surface p-[22px] md:flex"
        >
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-bold">{tb.kind}</p>
            <ChipGroup label={t.finder.kindGroup} items={kindItems} value={f.kind} onPick={(id) => update({ kind: id })} className="flex-wrap" />
          </div>
          {refine}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-0">
            <p aria-live="polite" className="text-sm text-muted md:text-[15px]">
              <strong className="text-lg text-fg md:text-xl">{results.length}</strong> {tb.count}
            </p>
            <p className="hidden text-[13px] text-subtle md:block">
              {tb.cardNote}
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
              {active ? format(tb.refineActive, { count: active }) : tb.refine}
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
              <p className="text-base font-bold md:text-[17px]">{tb.emptyTitle}</p>
              <p className="text-[13px] text-muted md:text-sm">
                {tb.emptyHint}
              </p>
            </div>
          ) : (
            <ul className={`${brandGridClass} px-5 md:px-0`}>
              {results.slice(0, shown).map((b) => (
                <li key={b.slug}>
                  <BrandCard
                    b={{ ...b, kindName: kindById.get(b.kind)!.name, look: kindById.get(b.kind)!.look }}
                    locale={locale}
                  />
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
              {format(t.common.showMore, { count: results.length - shown })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
