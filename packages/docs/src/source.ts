import { docUrl, type DocsConfig } from "./config.js";
export interface DocFile {
  locale: string;
  slug: string;
  raw: string;
}
export interface DocPage {
  slug: string;
  requestedLocale: string;
  contentLocale: string;
  title: string;
  description?: string;
  body: string;
  searchText?: string;
  lastUpdated?: string;
  toc: { id: string; text: string; level: number }[];
  canonicalUrl: string;
  url: string;
}
export function validSlug(slug: string) {
  return slug.split("/").every((s) => /^[\p{L}\p{N}_-]+$/u.test(s));
}

export interface DocsSnapshot {
  config: DocsConfig;
  pages: DocPage[];
}
export function createDocsIndex({ config, pages }: DocsSnapshot) {
  const byPath = new Map(
    pages.map((page) => [`${page.contentLocale}/${page.slug}`, page]),
  );
  const slugs = [...new Set(pages.map((page) => page.slug))];
  function loadDoc({
    locale,
    slug,
  }: {
    locale: string;
    slug: string;
  }): DocPage | undefined {
    if (!validSlug(slug) || !config.locales.includes(locale)) return undefined;
    const found =
      byPath.get(`${locale}/${slug}`) ??
      byPath.get(`${config.fallbackLocale}/${slug}`);
    return found
      ? {
          ...found,
          requestedLocale: locale,
          url: docUrl(config, locale, slug),
        }
      : undefined;
  }
  for (const section of config.navigation)
    for (const slug of section.items) {
      if (!validSlug(slug) || !pages.some((p) => p.slug === slug))
        throw new Error(`Missing navigation article: ${slug}`);
    }
  return {
    config,
    snapshot: () => ({ config, pages }),
    loadDoc,
    pages: () => pages,
    routes: () =>
      config.locales.flatMap((locale) =>
        slugs
          .filter((slug) => loadDoc({ locale, slug }))
          .map((slug) => docUrl(config, locale, slug)),
      ),
    searchEntries: (locale: string) =>
      slugs
        .map((slug) => loadDoc({ locale, slug }))
        .filter((p): p is DocPage => !!p),
  };
}

export type DocsSource = ReturnType<typeof createDocsIndex>;
