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
