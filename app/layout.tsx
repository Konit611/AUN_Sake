import type { Metadata } from "next";
import { Zen_Antique, Zen_Kaku_Gothic_New } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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

export const metadata: Metadata = {
  title: {
    default: "AUN — 酒と肴の、阿吽の呼吸。",
    template: "%s | AUN",
  },
  description:
    "一本の酒と一皿の肴が息を合わせる瞬間を、銘柄ごとに紹介します。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${zenKaku.variable} ${zenAntique.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
