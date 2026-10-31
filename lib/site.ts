import type { Metadata } from "next";

/**
 * 公開 URL。sitemap・canonical・OGP の絶対 URL に使う。
 * sitemap はビルド時に生成されるので、SITE_URL はビルド時に渡す（Dockerfile の ARG）。
 */
export const SITE_URL = new URL(process.env.SITE_URL ?? "http://localhost:3000");

export const SITE_NAME = "AUN";
export const SITE_TITLE = "AUN — 酒と肴の、阿吽の呼吸。";

/** ノートの RSS（<link rel="alternate">）。alternates は子で上書きされるので pageMetadata でも付ける */
export const FEED_ALTERNATES = {
  "application/rss+xml": [{ url: "/notes/feed.xml", title: "AUN ペアリングノート" }],
};
export const SITE_DESCRIPTION =
  "一本の酒と一皿の肴が息を合わせる瞬間を、銘柄ごとに紹介します。";

/**
 * ページごとの canonical と OGP。
 * 子ページで openGraph を書くと layout の openGraph は丸ごと置き換わるので、共通項目もここで入れる。
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  image = "/opengraph-image",
}: {
  title?: string;
  description?: string;
  path: string;
  type?: "website" | "article";
  /** OGP 画像。ここで指定すると同じルートの opengraph-image より優先されるので、自前の画像があるページはその URL を渡す */
  image?: string;
}): Metadata {
  return {
    ...(title && { title }),
    description: description ?? SITE_DESCRIPTION,
    alternates: { canonical: path, types: FEED_ALTERNATES },
    openGraph: {
      title: title ? `${title} | ${SITE_NAME}` : SITE_TITLE,
      description: description ?? SITE_DESCRIPTION,
      url: path,
      siteName: SITE_NAME,
      locale: "ja_JP",
      type,
      images: image,
    },
    twitter: { card: "summary_large_image" },
  };
}
