import type { Metadata } from "next";
import { defaultLocale, getDictionary, ogLocale, type Locale } from "./i18n";
import { paths } from "./routes";

/**
 * 公開 URL。sitemap・canonical・OGP の絶対 URL に使う。
 * sitemap はビルド時に生成されるので、SITE_URL はビルド時に渡す（Dockerfile の ARG）。
 */
export const SITE_URL = new URL(process.env.SITE_URL ?? "http://localhost:3000");

/** ブランド名。訳さない */
export const SITE_NAME = "AUN";

/** ノートの RSS（<link rel="alternate">）。alternates は子で上書きされるので pageMetadata でも付ける */
export function feedAlternates(locale: Locale) {
  return {
    "application/rss+xml": [{ url: paths.notesFeed(locale), title: getDictionary(locale).feed.title }],
  };
}

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
  locale = defaultLocale,
}: {
  title?: string;
  description?: string;
  /** canonical。paths（lib/routes.ts）で作った URL */
  path: string;
  type?: "website" | "article";
  /** OGP 画像。ここで指定すると同じルートの opengraph-image より優先されるので、自前の画像があるページはその URL を渡す */
  image?: string;
  locale?: Locale;
}): Metadata {
  const site = getDictionary(locale).site;
  return {
    ...(title && { title }),
    description: description ?? site.description,
    alternates: { canonical: path, types: feedAlternates(locale) },
    openGraph: {
      title: title ? `${title} | ${SITE_NAME}` : site.title,
      description: description ?? site.description,
      url: path,
      siteName: SITE_NAME,
      locale: ogLocale[locale],
      type,
      images: image,
    },
    twitter: { card: "summary_large_image" },
  };
}
