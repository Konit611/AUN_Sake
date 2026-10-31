"use client";

import Link from "next/link";
import { useState } from "react";
import type { PairingLevel } from "@/lib/types";
import { Glyph, PairingBadge } from "./ui";

export type FinderBrand = {
  slug: string;
  name: string;
  sub: string;
  maker: string;
  region: string;
  taste: string;
  tags: string[];
  serve: string;
  avoid?: string;
  pairs: { food: string; foodSlug: string; level: PairingLevel; why: string }[];
};

export type FinderCategory = {
  id: string;
  name: string;
  brands: FinderBrand[];
};

const pill =
  "flex-none cursor-pointer rounded-[14px] border-2 px-4 py-2 text-left text-[15px] whitespace-nowrap min-h-[52px] md:min-h-11 md:rounded-full md:px-5 md:py-2.5 md:text-base";
const pillOn = "border-accent bg-accent font-bold text-bg";
const pillOff = "border-line-strong bg-transparent font-medium text-fg hover:border-subtle";

export function PairFinder({ categories }: { categories: FinderCategory[] }) {
  const [catId, setCatId] = useState(categories[0].id);
  const cat = categories.find((c) => c.id === catId) ?? categories[0];
  const [brandSlug, setBrandSlug] = useState(cat.brands[0].slug);
  const cur = cat.brands.find((b) => b.slug === brandSlug) ?? cat.brands[0];

  const pickCategory = (id: string) => {
    const next = categories.find((c) => c.id === id)!;
    setCatId(id);
    setBrandSlug(next.brands[0].slug);
  };

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div className="flex flex-col gap-3.5">
        <p className="hidden text-sm font-medium text-muted md:block">1. 種類</p>
        {/* モバイルはセグメント、PC はピル */}
        <div
          role="group"
          aria-label="お酒の種類"
          style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
          className="mx-5 grid gap-1 rounded-[14px] bg-bg p-1 md:mx-0 md:flex md:flex-wrap md:gap-2 md:bg-transparent md:p-0"
        >
          {categories.map((c) => {
            const on = c.id === cat.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => pickCategory(c.id)}
                className={`min-h-11 cursor-pointer rounded-[10px] text-[15px] md:rounded-full md:border-2 md:px-5 md:py-2.5 md:text-base ${
                  on
                    ? "bg-accent font-bold text-bg md:border-accent"
                    : "font-medium text-fg md:border-line-strong md:hover:border-subtle"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        <p className="mt-2 hidden text-sm font-medium text-muted md:block">2. 銘柄</p>
        <div
          role="group"
          aria-label="銘柄"
          className="flex gap-2 overflow-x-auto px-5 pb-1 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
        >
          {cat.brands.map((b) => {
            const on = b.slug === cur.slug;
            return (
              <button
                key={b.slug}
                type="button"
                aria-pressed={on}
                onClick={() => setBrandSlug(b.slug)}
                className={`${pill} ${on ? pillOn : pillOff}`}
              >
                <span className="block text-[11px] opacity-85 md:mr-1.5 md:inline md:text-xs md:opacity-80">
                  {b.sub}
                </span>
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-5 flex flex-col gap-5 md:mx-0 md:flex-row md:flex-wrap md:items-stretch">
        {/* 阿：この一本 */}
        <div className="flex min-w-0 flex-col gap-2.5 rounded-[18px] border-2 border-line-strong bg-bg p-5 md:flex-[1_1_340px] md:gap-4 md:rounded-[20px] md:p-7">
          <div className="flex items-center gap-2.5 md:gap-3">
            <Glyph char="阿" className="text-[32px] md:text-[40px]" />
            <span className="text-xs tracking-[0.2em] text-muted md:text-[13px]">この一本</span>
          </div>
          <p className="text-2xl font-black md:text-[30px]">{cur.name}</p>
          <p className="text-[13px] text-muted md:text-sm">
            {cur.sub} ・ {cur.maker}（{cur.region}）
          </p>
          <p className="text-[15px] leading-[1.8] md:text-base">{cur.taste}</p>
          <ul className="flex flex-wrap gap-1.5">
            {cur.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-line-strong px-2.5 py-1 text-xs text-fg-2 md:text-[13px]"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[13px] text-muted md:mt-auto md:text-sm">
            おすすめの飲み方 ・ <span className="text-fg">{cur.serve}</span>
          </p>
          <Link
            href={`/brands/${cur.slug}`}
            className="hidden py-2.5 text-[15px] font-bold text-accent hover:text-accent-soft md:block"
          >
            銘柄ページを見る →
          </Link>
        </div>

        {/* 吽：息の合う肴 */}
        <div className="flex min-w-0 flex-col gap-1 rounded-[18px] border-2 border-accent bg-bg p-5 md:flex-[2_1_520px] md:gap-3.5 md:rounded-[20px] md:p-7">
          <div className="flex items-center gap-2.5 pb-1.5 md:gap-3 md:pb-0">
            <Glyph char="吽" className="text-[32px] text-accent md:text-[40px]" />
            <span className="text-xs tracking-[0.2em] text-muted md:text-[13px]">息の合う肴</span>
          </div>
          <ul>
            {cur.pairs.map((p) => (
              <li
                key={p.foodSlug}
                className="grid grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-1.5 border-t border-line py-3.5 md:items-start md:gap-x-4"
              >
                <PairingBadge level={p.level} />
                <p className="text-[17px] font-bold md:text-[19px]">
                  <Link href={`/foods/${p.foodSlug}`} className="hover:text-accent-soft">
                    {p.food}
                  </Link>
                </p>
                <p className="col-span-2 text-sm leading-[1.75] text-muted md:col-span-1 md:col-start-2 md:text-[15px] md:leading-[1.7]">
                  {p.why}
                </p>
              </li>
            ))}
          </ul>
          {cur.avoid && (
            <div className="mt-1.5 flex items-start gap-2.5 rounded-xl border border-dashed border-line-dashed px-3.5 py-3 md:mt-0 md:px-4 md:py-3.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="mt-[3px] hidden flex-none text-muted md:block"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 8l8 8" />
              </svg>
              <p className="text-sm leading-[1.7] text-fg-2 md:text-[15px]">
                <strong className="text-fg">息が合いにくい ・ </strong>
                {cur.avoid}
              </p>
            </div>
          )}
        </div>

        <Link
          href={`/brands/${cur.slug}`}
          className="flex min-h-12 items-center justify-center rounded-[14px] border-2 border-line-strong text-[15px] font-bold text-fg md:hidden"
        >
          銘柄ページを見る →
        </Link>
      </div>
    </div>
  );
}
