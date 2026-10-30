"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { search, type SearchEntry } from "@/lib/search";

const GROUPS: { kind: SearchEntry["kind"]; label: string }[] = [
  { kind: "brand", label: "お酒" },
  { kind: "food", label: "肴" },
  { kind: "category", label: "分類" },
];

const EXAMPLES = ["芋焼酎", "くろきりしま", "餃子", "辛口", "新潟"];

export function SearchBox({ entries }: { entries: SearchEntry[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const results = search(entries, query);

  const update = (q: string) => {
    setQuery(q);
    // 共有・戻るで同じ結果になるよう URL にも反映（履歴は積まない）
    const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
        <label htmlFor="q" className="text-sm font-medium text-muted">
          銘柄名・よみ・肴・産地・味わいで探す
        </label>
        <div className="relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            id="q"
            type="search"
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => update(e.target.value)}
            placeholder="例：黒霧島、ぎょうざ、辛口"
            className="h-14 w-full rounded-2xl border-2 border-line-strong bg-surface pl-12 pr-4 text-base text-fg placeholder:text-subtle focus:border-accent focus:outline-none md:text-lg [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
      </form>

      {query.trim() === "" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">たとえば</p>
          <ul className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onClick={() => update(ex)}
                  className="min-h-11 cursor-pointer rounded-full border-2 border-line-strong px-4 text-[15px] text-fg hover:border-subtle"
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <p role="status" className="text-sm text-muted">
            {results.length > 0
              ? `「${query.trim()}」の検索結果 ${results.length}件`
              : `「${query.trim()}」に一致するものは見つかりませんでした`}
          </p>
          {GROUPS.map(({ kind, label }) => {
            const items = results.filter((r) => r.kind === kind);
            if (items.length === 0) return null;
            return (
              <section key={kind} className="flex flex-col gap-3">
                <h2 className="text-lg font-black md:text-xl">
                  {label} <span className="text-sm font-medium text-muted">{items.length}</span>
                </h2>
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                  {items.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-surface px-[18px] py-4 text-fg hover:border-line-strong"
                      >
                        <span className="text-lg font-bold">{r.title}</span>
                        <span className="text-[13px] text-muted">{r.detail}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
