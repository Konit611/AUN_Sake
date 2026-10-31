import type { Metadata } from "next";
import { Zen_Antique, Zen_Kaku_Gothic_New } from "next/font/google";
import { Suspense } from "react";
import { HeaderView, SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultLocale, getDictionary, htmlLang, ogLocale } from "@/lib/i18n";
import { feedAlternates, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// 日本語フォントは unicode-range で数百ファイルに分かれるので preload しない
// （preload すると全ファイル 4MB 超を先読みしてしまう）
const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  preload: false,
});

// 「阿」「吽」の飾り文字だけに使う
const zenAntique = Zen_Antique({
  variable: "--font-zen-antique",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

// いまは既定の言語だけ。言語を足すときはルートの分け方を変える（docs/plan/i18n.md）
const locale = defaultLocale;
const t = getDictionary(locale);

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: t.site.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: t.site.description,
  openGraph: {
    siteName: SITE_NAME,
    locale: ogLocale[locale],
    type: "website",
  },
  // 画像は各ルートの opengraph-image.tsx（X は og:image を使う）
  twitter: { card: "summary_large_image" },
  alternates: { types: feedAlternates(locale) },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={htmlLang[locale]}
      className={`${zenKaku.variable} ${zenAntique.variable} h-full antialiased`}
    >
      <body className="group/page min-h-full flex flex-col font-sans">
        <Suspense fallback={<HeaderView pathname={null} locale={locale} />}>
          <SiteHeader locale={locale} />
        </Suspense>
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
