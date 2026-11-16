import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { DocsConfig } from "../config.js";
export { defineDocsConfig } from "../config.js";
export type { DocsConfig } from "../config.js";
import {
  createDocsIndex,
  validSlug,
  type DocPage,
  type DocFile,
} from "../source.js";
import { docUrl } from "../config.js";
export { docUrl } from "../config.js";
export type { DocPage, DocFile, DocsSource } from "../source.js";
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
    const tree = unified().use(remarkParse).parse(body);
    visit(tree, "heading", (node) => {
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
      searchText: tree.children.map((node) => toString(node)).join("\n"),
      lastUpdated: data.lastUpdated ? String(data.lastUpdated) : undefined,
      toc,
      url,
      canonicalUrl: config.siteUrl + url,
    });
  }
  return createDocsIndex({ config, pages });
}
export { writeDocsArtifacts } from "./artifacts.js";
export { readDocsSource } from "./files.js";
