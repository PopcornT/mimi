import { it, expect } from "vitest";
import {
  defineDocsConfig,
  createDocsSource,
} from "../packages/docs/src/content/index";
import { docUrl, resolveDocHref } from "../packages/docs/src/config";
const config = defineDocsConfig({
  title: "Docs",
  siteUrl: "https://docs.example.com",
  locales: ["zh-TW", "en"],
  defaultLocale: "zh-TW",
  fallbackLocale: "zh-TW",
  navigation: [{ title: "Start", items: ["intro"] }],
});
it("keeps embedded navigation within /docs with locale, query and heading intact", () => {
  const embedded = { ...config, routing: "query" as const };
  expect(docUrl(embedded, "en", "intro")).toBe("/docs/intro?lang=en");
  expect(
    resolveDocHref(embedded, "en", "intro", "#/docs/intro?ref=guide#setup"),
  ).toBe("/docs/intro?lang=en&ref=guide#setup");
  expect(
    resolveDocHref(embedded, "zh-TW", "intro", "nested/安裝.md#開始"),
  ).toBe("/docs/nested/%E5%AE%89%E8%A3%9D?lang=zh-TW#%E9%96%8B%E5%A7%8B");
});
it("preserves source metadata and searchable text for both embedded and standalone consumers", () => {
  const source = createDocsSource(config, [
    {
      locale: "zh-TW",
      slug: "intro",
      raw: '---\nlastUpdated: "2026-11-15"\n---\n# 開始\n\n**申訴** [說明](https://example.com)',
    },
  ]);
  const page = source.loadDoc({ locale: "en", slug: "intro" });
  expect(page).toMatchObject({
    lastUpdated: "2026-11-15",
    searchText: "申訴 說明",
    canonicalUrl: "https://docs.example.com/zh-TW/docs/intro/",
  });
});
