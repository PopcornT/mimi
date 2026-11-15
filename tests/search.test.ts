import { it, expect } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createDocsSource,
  defineDocsConfig,
  writeDocsArtifacts,
} from "../packages/docs/src/content/index";
import { searchDocs } from "../packages/docs/src/search/index";

it("searches exported content in Chinese and English, ranks titles, and excludes drafts", async () => {
  const source = createDocsSource(
    defineDocsConfig({
      title: "Docs",
      siteUrl: "https://example.com",
      locales: ["zh-TW", "en"],
      defaultLocale: "zh-TW",
      fallbackLocale: "zh-TW",
      navigation: [],
    }),
    [
      {
        locale: "zh-TW",
        slug: "body",
        raw: "# 操作\n\n請在成績申訴頁面提交。",
      },
      {
        locale: "zh-TW",
        slug: "appeal",
        raw: "# 成績申訴\n\n## 期限\n\n七天內提出。",
      },
      {
        locale: "en",
        slug: "setup",
        raw: "# API Setup\n\nUse an access token.",
      },
      {
        locale: "en",
        slug: "hidden",
        raw: "---\ndraft: true\n---\n# Private secret",
      },
    ],
  );
  const dir = mkdtempSync(join(tmpdir(), "docs-search-"));
  try {
    await writeDocsArtifacts(source, dir);
    const zh = JSON.parse(
      readFileSync(join(dir, "search-index.zh-TW.json"), "utf8"),
    );
    const en = JSON.parse(
      readFileSync(join(dir, "search-index.en.json"), "utf8"),
    );
    expect(searchDocs(zh, "申訴").map((p) => p.url)).toEqual([
      "/zh-TW/docs/appeal/",
      "/zh-TW/docs/body/",
    ]);
    expect(searchDocs(zh, "七天")[0]?.title).toBe("成績申訴");
    expect(searchDocs(en, "ＡＰＩ token")[0]?.url).toBe("/en/docs/setup/");
    expect(searchDocs(en, "申訴")[0]?.url).toBe("/en/docs/appeal/");
    expect(searchDocs(en, "private")).toEqual([]);
    expect(searchDocs(zh, "token")).toEqual([]);
    expect(searchDocs(en, "API missing")).toEqual([]);
    expect(searchDocs(en, "   ")).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
