import { describe, it, expect } from "vitest";
import {
  createDocsSource,
  defineDocsConfig,
} from "../packages/docs/src/content/index";
const config = {
  title: "Docs",
  siteUrl: "https://docs.example.com",
  defaultLocale: "zh-TW",
  fallbackLocale: "zh-TW",
  locales: ["zh-TW", "en"],
  navigation: [{ title: "Guide", items: ["intro", "nested/setup"] }],
};
const files = [
  { locale: "zh-TW", slug: "intro", raw: "# 開始\n\n## 設定\n\n文章內容" },
  { locale: "en", slug: "intro", raw: "# Start\n\nEnglish article" },
  {
    locale: "zh-TW",
    slug: "nested/setup",
    raw: "---\ntitle: 安裝\n---\n# 安裝\n\n設定步驟",
  },
];
describe("content contract", () => {
  it("indexes real content and preserves nested slugs", () => {
    const s = createDocsSource(defineDocsConfig(config), files);
    expect(s.loadDoc({ locale: "zh-TW", slug: "nested/setup" })?.title).toBe(
      "安裝",
    );
    expect(s.routes()).toContain("/zh-TW/docs/nested/setup/");
  });
  it("reports the actual fallback language and canonical", () => {
    const p = createDocsSource(defineDocsConfig(config), files).loadDoc({
      locale: "en",
      slug: "nested/setup",
    });
    expect(p?.contentLocale).toBe("zh-TW");
    expect(p?.requestedLocale).toBe("en");
    expect(p?.canonicalUrl).toBe(
      "https://docs.example.com/zh-TW/docs/nested/setup/",
    );
  });
  it("returns undefined for missing articles and unsupported locales", () => {
    const s = createDocsSource(defineDocsConfig(config), files);
    expect(s.loadDoc({ locale: "en", slug: "missing" })).toBeUndefined();
    expect(s.loadDoc({ locale: "xx", slug: "intro" })).toBeUndefined();
  });
  it("rejects traversal and duplicate routes", () => {
    expect(() =>
      createDocsSource(defineDocsConfig(config), [
        ...files,
        { locale: "en", slug: "../secret", raw: "# Secret" },
      ]),
    ).toThrow();
    expect(() =>
      createDocsSource(defineDocsConfig(config), [...files, files[0]]),
    ).toThrow(/duplicate/i);
  });
  it("rejects missing navigation pages", () => {
    expect(() =>
      createDocsSource(
        defineDocsConfig({
          ...config,
          navigation: [{ title: "Oops", items: ["missing"] }],
        }),
        files,
      ),
    ).toThrow(/missing/i);
  });
  it("does not advertise fallback translations as real sitemap entries", () => {
    const s = createDocsSource(defineDocsConfig(config), files);
    expect(s.pages().map((p) => p.canonicalUrl)).not.toContain(
      "https://docs.example.com/en/docs/nested/setup/",
    );
  });
});
it("matches formatted and repeated heading anchors to rendered Markdown", () => {
  const s = createDocsSource(defineDocsConfig(config), [
    {
      locale: "zh-TW",
      slug: "intro",
      raw: "# Title\n\n## [設定](https://example.com)\n\n## **設定**\n\n~~~md\n## hidden\n~~~",
    },
    { locale: "zh-TW", slug: "nested/setup", raw: "# Setup" },
  ]);
  expect(
    s.loadDoc({ locale: "zh-TW", slug: "intro" })?.toc.map((h) => h.id),
  ).toEqual(["設定", "設定-1"]);
});
import { resolveDocHref } from "../packages/docs/src/config";
it("rewrites legacy and relative article links but preserves external URLs and images", () => {
  const c = defineDocsConfig(config);
  expect(
    resolveDocHref(c, "zh-TW", "intro", "#/docs/nested/setup#section"),
  ).toBe("/zh-TW/docs/nested/setup/#section");
  expect(resolveDocHref(c, "en", "nested/setup", "../intro.md")).toBe(
    "/en/docs/intro/",
  );
  expect(resolveDocHref(c, "en", "intro", "/docs/images/example.png")).toBe(
    "/docs/images/example.png",
  );
  expect(resolveDocHref(c, "en", "intro", "https://example.com/docs")).toBe(
    "https://example.com/docs",
  );
});
import { resolveLegacyUrl } from "../packages/docs/src/config";
it("preserves query and anchor while migrating a known fallback route", () => {
  const c = defineDocsConfig(config);
  const routes = ["/en/docs/nested/setup/"];
  expect(
    resolveLegacyUrl(
      c,
      "#/docs/nested/setup?lang=en#section",
      "?ref=guide",
      routes,
    ),
  ).toBe("/en/docs/nested/setup/?ref=guide&lang=en#section");
  expect(resolveLegacyUrl(c, "#/docs/unknown", "", routes)).toBeUndefined();
});
import { resolveDocsTheme } from "../packages/docs/src/config";
it("light and system-light remain light when the configured Carbon theme is dark", () => {
  expect(resolveDocsTheme("g90", "light", false)).toBe("g10");
  expect(resolveDocsTheme("g100", "system", false)).toBe("white");
  expect(resolveDocsTheme("g10", "dark", false)).toBe("g90");
});
it("encodes Unicode article slugs exactly once", () => {
  const c = defineDocsConfig(config);
  expect(resolveDocHref(c, "zh-TW", "intro", "#/docs/安裝")).toBe(
    "/zh-TW/docs/%E5%AE%89%E8%A3%9D/",
  );
  expect(resolveDocHref(c, "zh-TW", "intro", "/docs/%E5%AE%89%E8%A3%9D")).toBe(
    "/zh-TW/docs/%E5%AE%89%E8%A3%9D/",
  );
});
