import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { loader, type StaticSource } from "fumadocs-core/source";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { DocsConfig } from "../config.js";
export { defineDocsConfig } from "../config.js";
export type { DocsConfig } from "../config.js";
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
  toc: { id: string; text: string; level: number }[];
  canonicalUrl: string;
  url: string;
}
import { docUrl } from "../config.js";
export { docUrl } from "../config.js";
export function validSlug(slug: string) {
  return slug.split("/").every((s) => /^[\p{L}\p{N}_-]+$/u.test(s));
}
export function createDocsSource(config: DocsConfig, files: DocFile[]) {
  const keys = new Set<string>();
  const pages: DocPage[] = [];
  for (const file of files) {
    if (!validSlug(file.slug) || !config.locales.includes(file.locale))
      throw new Error(`Invalid content path: ${file.locale}/${file.slug}`);
    const key = `${file.locale}/${file.slug}`;
    if (keys.has(key)) throw new Error(`Duplicate content: ${key}`);
    keys.add(key);
    const { data, content } = matter(file.raw);
    if (data.draft === true) continue;
    const leading = content.match(/^\s*#\s+(.+)\r?\n*/);
    const title = String(data.title || leading?.[1] || file.slug);
    const body = leading ? content.slice(leading[0].length) : content;
    const slugger = new GithubSlugger();
    const toc: DocPage["toc"] = [];
    visit(unified().use(remarkParse).parse(body), "heading", (node) => {
      const text = toString(node);
      toc.push({ id: slugger.slug(text), text, level: node.depth });
    });
    const url = docUrl(config, file.locale, file.slug);
    pages.push({
      slug: file.slug,
      requestedLocale: file.locale,
      contentLocale: file.locale,
      title,
      description: data.description,
      body,
      toc,
      url,
      canonicalUrl: config.siteUrl + url,
    });
  }
  const sources = new Map(
    config.locales.map((locale) => {
      const source: StaticSource<{
        pageData: DocPage;
        metaData: { title?: string };
      }> = {
        files: pages
          .filter((p) => p.contentLocale === locale)
          .map((p) => ({
            type: "page" as const,
            path: p.slug + ".md",
            slugs: p.slug.split("/"),
            data: p,
          })),
      };
      return [
        locale,
        loader(source, { baseUrl: `/${locale}${config.basePath}` }),
      ];
    }),
  );
  function loadDoc({
    locale,
    slug,
  }: {
    locale: string;
    slug: string;
  }): DocPage | undefined {
    if (!validSlug(slug) || !config.locales.includes(locale)) return undefined;
    const found =
      sources.get(locale)?.getPage(slug.split("/")) ??
      sources.get(config.fallbackLocale)?.getPage(slug.split("/"));
    return found
      ? {
          ...found.data,
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
    loadDoc,
    pages: () => pages,
    routes: () =>
      config.locales.flatMap((locale) =>
        [...new Set(pages.map((p) => p.slug))]
          .filter((slug) => loadDoc({ locale, slug }))
          .map((slug) => docUrl(config, locale, slug)),
      ),
    searchEntries: (locale: string) =>
      [...new Set(pages.map((p) => p.slug))]
        .map((slug) => loadDoc({ locale, slug }))
        .filter((p): p is DocPage => !!p),
  };
}
export type DocsSource = ReturnType<typeof createDocsSource>;
export { writeDocsArtifacts } from "./artifacts.js";
