import type { ReactNode } from "react";
import { PAIRING_LEVELS, type PairingLevel } from "@/lib/types";

/** 英字の小見出し + 見出し */
export function SectionHeading({
  eyebrow,
  title,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="flex flex-col gap-2 md:gap-2.5">
      <p className="text-xs font-bold tracking-[0.2em] text-accent md:text-sm">{eyebrow}</p>
      <Tag className="text-2xl font-black leading-[1.4] md:text-[38px]">{title}</Tag>
    </div>
  );
}

/** 「阿」「吽」の飾り文字 */
export function Glyph({ char, className = "" }: { char: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`font-antique leading-none ${className}`}>
      {char}
    </span>
  );
}

const BADGE: Record<PairingLevel, string> = {
  aun: "bg-accent text-bg px-2 py-[5px]",
  good: "border-2 border-subtle text-fg px-1.5 py-[3px]",
  surprise: "border-2 border-dashed border-mint text-mint-fg px-1.5 py-[3px]",
};

export function PairingBadge({ level }: { level: PairingLevel }) {
  return (
    <span
      className={`inline-block min-w-[52px] flex-none rounded-lg text-center text-[13px] font-bold ${BADGE[level]}`}
    >
      {PAIRING_LEVELS[level].label}
    </span>
  );
}

/** 写真が入るまでの枠 */
export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-raised px-4 text-center text-[13px] text-subtle md:text-sm ${className}`}
    >
      {label}
    </div>
  );
}

/**
 * 選択できるピル（種類・味わい・小分類タブなど）の class。
 * md：ページ内の主な切り替え、sm：絞り込みパネルのような密な並び
 */
export function chipClass(on: boolean, size: "sm" | "md" = "md"): string {
  const base =
    "inline-flex flex-none cursor-pointer items-center justify-center whitespace-nowrap rounded-full border-2";
  const sizes = {
    md: "min-h-11 px-5 text-[15px] md:text-base",
    sm: "min-h-11 px-4 text-sm md:min-h-10 md:px-3.5",
  };
  const state = on
    ? "border-accent bg-accent font-bold text-bg"
    : "border-line-strong font-medium text-fg hover:border-subtle";
  return `${base} ${sizes[size]} ${state}`;
}

/** 銘柄のタグ（芋の甘み・黒麹…）。選べない、表示だけのもの */
export function TagList({ tags }: { tags: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-line-strong px-2.5 py-1 text-xs text-fg-2 md:text-[13px]">
          {t}
        </li>
      ))}
    </ul>
  );
}
