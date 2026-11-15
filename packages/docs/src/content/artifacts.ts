import fs from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";
import type { SearchEntry } from "../search/index.js";
import type { DocsSource } from "./index.js";
const xml = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
export async function writeDocsArtifacts(source: DocsSource, outDir: string) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const locale of source.config.locales) {
    const index: SearchEntry[] = source.searchEntries(locale).map((p) => ({
      title: p.title,
      description: p.description,
      text: unified()
        .use(remarkParse)
        .parse(p.body)
        .children.map((node) => toString(node))
        .join("\n"),
      url: p.url,
    }));
    fs.writeFileSync(
      path.join(outDir, `search-index.${locale}.json`),
      JSON.stringify(index),
    );
  }
  fs.writeFileSync(
    path.join(outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${source
      .pages()
      .map((p) => `<url><loc>${xml(p.canonicalUrl)}</loc></url>`)
      .join("")}</urlset>`,
  );
  fs.writeFileSync(
    path.join(outDir, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${source.config.siteUrl}/sitemap.xml\n`,
  );
  const pages = source
    .pages()
    .filter((p) => p.contentLocale === source.config.defaultLocale);
  fs.writeFileSync(
    path.join(outDir, "llms.txt"),
    `# ${source.config.title}\n\n` +
      pages.map((p) => `- [${p.title}](${p.canonicalUrl})`).join("\n"),
  );
  fs.writeFileSync(
    path.join(outDir, "llms-full.txt"),
    pages.map((p) => `# ${p.title}\n\n${p.body}`).join("\n\n"),
  );
  // This document is served at arbitrary missing URLs, not just the prerendered /404 route.
  // Hydrating it would mismatch the client route; keep the error document static.
  const notFound = path.join(outDir, "404/index.html");
  if (fs.existsSync(notFound))
    fs.writeFileSync(
      path.join(outDir, "404.html"),
      fs
        .readFileSync(notFound, "utf8")
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, ""),
    );
}
