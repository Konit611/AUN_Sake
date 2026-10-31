import Link from "next/link";
import { format, getDictionary, type Locale } from "@/lib/i18n";
import { PhotoPlaceholder } from "./ui";

export function NoteCard({
  href,
  title,
  brandName,
  foodName,
  locale,
}: {
  href: string;
  title: string;
  brandName: string;
  foodName: string;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <Link
      href={href}
      className="flex flex-[0_0_280px] flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg hover:border-line-strong md:flex-auto md:rounded-[20px]"
    >
      <PhotoPlaceholder
        label={format(t.common.photoPair, { brand: brandName, food: foodName })}
        className="h-[150px] md:h-[190px]"
      />
      <div className="flex flex-col gap-1.5 px-4 pb-[18px] pt-3.5 md:gap-2.5 md:px-[22px] md:pb-6 md:pt-5">
        <p className="text-xs text-muted md:text-sm">
          <span className="font-bold text-fg">阿</span> {brandName}
          <span className="mx-1.5">×</span>
          <span className="font-bold text-accent">吽</span> {foodName}
        </p>
        <p className="text-base font-bold leading-normal md:text-xl">{title}</p>
      </div>
    </Link>
  );
}
