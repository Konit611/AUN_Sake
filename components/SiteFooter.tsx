import { getDictionary, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer id="about" className="border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 pb-10 pt-6 text-xs leading-[1.7] text-subtle md:flex-row md:flex-wrap md:justify-between md:gap-4 md:px-6 md:py-8 md:text-sm">
        <span>{t.site.copyright}</span>
        <span>{t.site.legal}</span>
      </div>
    </footer>
  );
}
