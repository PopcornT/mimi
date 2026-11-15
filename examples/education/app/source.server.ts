import fs from "node:fs";
import path from "node:path";
import { createDocsSource, defineDocsConfig } from "@qjudge/docs/content";
import rawConfig from "../docs.config.json";
const contentDir = path.resolve(process.env.DOCS_CONTENT_DIR || "content");
const config = defineDocsConfig(rawConfig);
const files = config.locales.flatMap((locale) => {
  const dir = path.join(contentDir, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true })
    .filter((f): f is string => typeof f === "string" && f.endsWith(".md"))
    .map((f) => ({
      locale,
      slug: f.slice(0, -3).replaceAll("\\", "/"),
      raw: fs.readFileSync(path.join(dir, f), "utf8"),
    }));
});
export const source = createDocsSource(config, files);
