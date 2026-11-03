import type { KindIcon as KindIconName } from "@/lib/types";

// 写真が入るまでの、お酒の種類のシルエット（viewBox 32×56）。大分類の look.icon で選ぶ
const PATHS: Record<KindIconName, React.ReactNode> = {
  bottle: (
    <>
      <path d="M13 2h6v10c0 2 5 4 5 9v31a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V21c0-5 5-7 5-9z" />
      <path d="M8 30h16v12H8z" />
    </>
  ),
  mug: (
    <>
      <path d="M6 12h20l-2 40H8z" />
      <path d="M6 12c1-4 5-5 7-3 2-3 7-3 9 0 2-1 5 0 4 3" />
      <path d="M7 24h18" />
    </>
  ),
  tokkuri: (
    <>
      <path d="M13 4h6l-1 6c6 4 8 10 8 20 0 12-4 22-10 22S6 42 6 30c0-10 2-16 8-20z" />
      <path d="M12 4h8" />
    </>
  ),
  "wine-glass": (
    <>
      <path d="M8 4h16c1 10-1 18-8 19-7-1-9-9-8-19z" />
      <path d="M8.5 12h15" />
      <path d="M16 23v26" />
      <path d="M10 52h12" />
    </>
  ),
};

export function KindIcon({
  icon,
  stroke,
  className,
}: {
  icon: KindIconName;
  stroke: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 56"
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[icon]}
    </svg>
  );
}
