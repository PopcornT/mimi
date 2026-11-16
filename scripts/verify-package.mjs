import {
  mkdtempSync,
  mkdirSync,
  cpSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
const root = process.cwd();
const packDir = path.join(root, "output/packages");
mkdirSync(packDir, { recursive: true });
const packed = JSON.parse(
  execFileSync(
    "npm",
    ["pack", "-w", "@popcornt/mimi", "--pack-destination", packDir, "--json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  ),
)[0];
for (const file of ['dist/licenses/carbon-react/LICENSE', 'dist/licenses/carbon-styles/LICENSE', 'dist/licenses/carbon-icons-react/LICENSE', 'dist/fonts/LICENSE.txt', 'dist/THIRD_PARTY_NOTICES.md', 'LICENSE', 'README.md']) {
  if (!packed.files.some(entry => entry.path === file)) throw new Error(`Missing release file: ${file}`);
}
for (const site of ["education", "business"]) {
  const dir = mkdtempSync(path.join(tmpdir(), "qjudge-docs-" + site + "-"));
  cpSync(path.join(root, "examples", site), dir, {
    recursive: true,
    filter: (src) =>
      !src
        .split(path.sep)
        .some((p) => ["node_modules", "build", ".react-router"].includes(p)),
  });
  const manifest = JSON.parse(
    readFileSync(path.join(dir, "package.json"), "utf8"),
  );
  manifest.dependencies["@popcornt/mimi"] =
    "file:" + path.join(packDir, packed.filename);
  manifest.devDependencies = {
    ...manifest.devDependencies,
    vite: "8.3.6",
    typescript: "~5.9.3",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.0",
    "@types/node": "^22.0.0",
  };
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(manifest, null, 2),
  );
  execFileSync("npm", ["install", "--ignore-scripts"], {
    cwd: dir,
    stdio: "inherit",
  });
  const expected = readFileSync(
    path.join(root, "packages/docs/dist/carbon/DocsLayout.js"),
  );
  const installed = readFileSync(
    path.join(dir, "node_modules/@popcornt/mimi/dist/carbon/DocsLayout.js"),
  );
  if (!expected.equals(installed))
    throw new Error("Installed package differs from built artifact");
  execFileSync("npm", ["run", "build"], { cwd: dir, stdio: "inherit" });
  if (
    !existsSync(path.join(dir, "build/client/zh-TW/docs/overview/index.html"))
  )
    throw new Error("Missing standalone HTML");
  console.log("PACKED CONSUMER PASS", site, dir);
}
