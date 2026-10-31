"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LogoMark } from "./Logo";

const NAV = [
  { href: "/brands", label: "銘柄から探す" },
  { href: "/categories", label: "お酒の分類" },
  { href: "/notes", label: "ペアリングノート" },
  { href: "/#about", label: "AUNとは" },
];

function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname || href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const icon = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// このタブでサイト内を移動したか。「戻る」で履歴を戻ってよいかの判断に使う
let movedInSite = false;

/** usePathname は動的ルートの fallback で suspend するので、layout では Suspense で包む */
export function SiteHeader() {
  const pathname = usePathname();
  const first = useRef(pathname);
  useEffect(() => {
    if (pathname !== first.current) movedInSite = true;
  }, [pathname]);
  return <HeaderView pathname={pathname} />;
}

/** pathname が null（Suspense の fallback）なら現在地の強調なし・ホーム用のモバイルバー */
export function HeaderView({ pathname }: { pathname: string | null }) {
  const isHome = pathname === null || pathname === "/";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg md:static">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 py-2 pl-1 pr-2 md:px-6 md:py-[18px]">
        {/* モバイル：ホーム以外は「戻る」＋中央のロゴ */}
        {!isHome && <BackButton />}

        <Link
          href="/"
          aria-label="AUN ホーム"
          className={`flex min-h-11 items-center gap-2 text-fg md:gap-3 ${isHome ? "pl-3 md:pl-0" : ""}`}
        >
          <LogoMark
            className={`text-accent md:h-6 md:w-11 ${isHome ? "h-5 w-9" : "h-[18px] w-8"}`}
          />
          <span
            className={`font-black tracking-[0.18em] md:text-[26px] ${isHome ? "text-[22px]" : "text-lg"}`}
          >
            AUN
          </span>
        </Link>

        <nav aria-label="メインメニュー" className="hidden flex-wrap gap-0.5 md:flex">
          {NAV.map((item) => {
            const current = isCurrent(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`px-3.5 py-3 text-[15px] ${
                  current ? "font-bold text-accent" : "font-medium text-fg hover:text-accent-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center md:hidden">
          {isHome && (
            <Link
              href="/search"
              aria-label="検索"
              className="flex size-11 items-center justify-center text-fg"
            >
              <svg {...icon}>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
            </Link>
          )}

          {/* JS なしで開閉できる details。ページが変わったら key で閉じる */}
          <details key={pathname} className="group relative">
            <summary
              aria-label="メニュー"
              className="flex size-11 cursor-pointer list-none items-center justify-center text-fg [&::-webkit-details-marker]:hidden"
            >
              <svg {...icon}>
                <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
                <path d="M6 6l12 12M18 6L6 18" className="hidden group-open:block" />
              </svg>
            </summary>
            <nav
              aria-label="メインメニュー"
              className="absolute right-0 top-full mt-2 flex w-56 flex-col rounded-2xl border border-line bg-surface p-2"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-fg hover:bg-raised aria-[current=page]:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="戻る"
      onClick={() => {
        // サイト内から来たときだけ履歴を戻る。直接開いたときはホームへ
        const fromSite = movedInSite || document.referrer.startsWith(window.location.origin);
        if (fromSite) router.back();
        else router.push("/");
      }}
      className="flex size-11 cursor-pointer items-center justify-center text-fg md:hidden"
    >
      <svg {...icon}>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
