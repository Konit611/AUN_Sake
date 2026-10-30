import Link from "next/link";
import { LogoMark } from "./Logo";

const NAV = [
  { href: "/#pick", label: "銘柄から探す" },
  { href: "/foods", label: "肴から探す" },
  { href: "/#kinds", label: "お酒の分類" },
  { href: "/notes", label: "ペアリングノート" },
  { href: "/#about", label: "AUNとは" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg md:static">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 py-2 pl-4 pr-2 md:px-6 md:py-[18px]">
        <Link
          href="/"
          aria-label="AUN ホーム"
          className="flex min-h-11 items-center gap-2.5 text-fg md:gap-3"
        >
          <LogoMark className="h-5 w-9 text-accent md:h-6 md:w-11" />
          <span className="text-[22px] font-black tracking-[0.18em] md:text-[26px]">
            AUN
          </span>
        </Link>

        <div className="flex items-center">
          <nav aria-label="メインメニュー" className="hidden flex-wrap gap-0.5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-3 text-[15px] font-medium text-fg hover:text-accent-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/search"
            aria-label="検索"
            className="flex size-11 items-center justify-center text-fg hover:text-accent-soft md:ml-1"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
          </Link>

          {/* モバイル：JS なしで開閉できる details メニュー */}
          <details className="group relative md:hidden">
            <summary
              aria-label="メニュー"
              className="flex size-11 cursor-pointer list-none items-center justify-center text-fg [&::-webkit-details-marker]:hidden"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
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
                  className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-fg hover:bg-raised"
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
