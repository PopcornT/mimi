import fs from "node:fs";
import path from "node:path";
import { createDocsSource, defineDocsConfig } from "./index.js";
/** Read only the explicitly public content directory, never the repository root. */
export function readDocsSource({
  contentDir,
  configPath = path.join(contentDir, "config.json"),
}: {
  contentDir: string;
  configPath?: string;
}) {
  const config = defineDocsConfig(
    JSON.parse(fs.readFileSync(configPath, "utf8")),
  );
  const files = config.locales.flatMap((locale) => {
    const dir = path.join(contentDir, locale);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { recursive: true })
      .filter(
        (file): file is string =>
          typeof file === "string" && file.endsWith(".md"),
      )
      .map((file) => ({
        locale,
        slug: file.slice(0, -3).replaceAll("\\", "/"),
        raw: fs.readFileSync(path.join(dir, file), "utf8"),
      }));
  });
  return createDocsSource(config, files);
}
