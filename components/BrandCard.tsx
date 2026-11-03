import Link from "next/link";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { paths } from "@/lib/routes";
import type { Category, TasteKeyword } from "@/lib/types";
import { KindIcon } from "./KindIcon";
import { Glyph } from "./ui";

/** 銘柄カードに要るもの。サーバー・クライアントどちらからも渡せるよう、値だけにする */
export type BrandCardData = {
  slug: string;
  name: string;
  kindName: string;
  sub: string;
  maker: string;
  region: string;
  tastes: readonly TasteKeyword[];
  /** いちばん息が合う肴 */
  pair?: string;
  look: Category["look"];
};

/** 「銘柄から探す」のカード。モバイルは横長、PC は縦長 */
export function BrandCard({ b, locale }: { b: BrandCardData; locale: Locale }) {
  const t = getDictionary(locale);
  const sep = t.common.sep;
  const tastes = b.tastes.map((id) => t.tastes[id]);
  return (
    <Link
      href={paths.brand(b.slug, locale)}
      className="flex h-full overflow-hidden rounded-2xl border border-line bg-surface text-fg hover:border-line-strong md:flex-col md:rounded-[18px]"
    >
      <div
        role="img"
        aria-label={format(t.common.photoPending, { name: b.name })}
        style={{ background: b.look.tint }}
        className="relative flex min-h-[124px] flex-[0_0_96px] items-center justify-center md:h-[180px] md:min-h-0 md:flex-none"
      >
        <KindIcon icon={b.look.icon} stroke={b.look.stroke} className="h-14 w-8 md:h-[106px] md:w-[60px]" />
        <span className="absolute bottom-2.5 left-3.5 hidden text-xs text-muted md:block">
          {format(t.common.photo, { name: b.name })}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3 md:gap-3 md:px-5 md:pb-5 md:pt-[18px]">
        <p className="text-[11px] text-muted md:hidden">
          {[b.kindName, b.sub, b.region].join(sep)}
        </p>
        <div className="hidden items-center justify-between gap-2 md:flex">
          <span className="rounded-full border border-line-strong px-2.5 py-[3px] text-xs text-fg-2">
            {[b.kindName, b.sub].join(sep)}
          </span>
          <span className="text-xs text-subtle">{b.region}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[17px] font-black leading-[1.4] md:text-[21px]">{b.name}</p>
          <p className="text-xs text-subtle md:hidden">
            {[b.maker, tastes.join(t.common.sepTight)].join(sep)}
          </p>
          <p className="hidden text-[13px] text-muted md:block">{b.maker}</p>
        </div>
        <p className="hidden text-sm text-fg-2 md:block">{tastes.join(sep)}</p>
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

/** 銘柄カードの並び。/brands と /categories/[id] で同じ */
export const brandGridClass =
  "flex flex-col gap-3 md:grid md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-4";
