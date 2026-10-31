"use client";

import { Children, useState, type ReactNode } from "react";

/**
 * <li> の並びを先頭 step 件だけ描画し、「もっと見る」で step 件ずつ足す。
 * HTML と DOM は件数に比例しなくなるが、RSC ペイロードには全件が入る。
 * 数千件になったら、ルートでのページ分割（/foods/page/2 など）に切り替える。
 */
export function ShowMore({
  children,
  step = 24,
  className,
}: {
  children: ReactNode;
  step?: number;
  className?: string;
}) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(step);
  const rest = items.length - shown;

  return (
    <>
      <ul className={className}>{items.slice(0, shown)}</ul>
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setShown(shown + step)}
          className="mx-auto flex min-h-11 cursor-pointer items-center rounded-full border-2 border-line-strong px-6 text-[15px] font-bold text-fg hover:border-subtle"
        >
          もっと見る（残り{rest}）
        </button>
      )}
    </>
  );
}
