import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

/** 最後の項目は現在のページ（href なし） */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="パンくず" className={`text-xs text-muted md:text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${i}-${item.label}`}>
              {i > 0 && <li aria-hidden="true">/</li>}
              <li aria-current={last ? "page" : undefined} className={last ? "text-fg" : ""}>
                {item.href && !last ? (
                  <Link href={item.href} className="inline-block py-1 hover:text-fg md:py-3">
                    {item.label}
                  </Link>
                ) : (
                  <span className="inline-block py-1 md:py-3">{item.label}</span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
