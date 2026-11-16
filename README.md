# QJudge Carbon Docs

A reusable Carbon documentation package for QJudge's own product lines. Our content loader and static search are owned in this repository; React Router prerenders pages; the UI retains QJudge's Carbon layout and Markdown components.

## Local development

Use Node 24 (minimum 22.12) and npm. From this repository:

```sh
npm ci
npm run build
npm run build:examples
npm test
npm run test:browser
npm run verify:package
```

`test:browser` starts static servers on 4317/4318. Locally it uses installed Chrome; CI installs Playwright Chromium. `verify:package` packs the package and installs both consumers into fresh temporary directories, without workspace links.

## Product ownership

- This repository: Carbon components, content adapter, build-time artifacts, package tests and releases.
- Product repositories: Markdown, images, navigation, branding, domain and deployment.
- One package (`@popcornt/qjudge-docs`), pinned independently by each product. Published privately through GitHub Packages under PopcornT.

Start from `examples/business`. Configure `docs.config.json`, add files to `content/<locale>/<slug>.md`, then build with React Router. It emits `build/client`, suitable for static hosting. Configure your host to serve its `404.html` with HTTP 404; do not turn all unknown URLs into an SPA fallback.

The examples use simple explicit route modules rather than an additional custom CLI. No Fumadocs packages are installed. Only Markdown is supported in this first release; MDX is deferred.

## Package API

- `@popcornt/qjudge-docs`: `DocsLayout`, `MarkdownRenderer`, `defineDocsConfig`, `resolveLegacyUrl`, public types.
- `@popcornt/qjudge-docs/content`: build/server-only `createDocsSource`, `writeDocsArtifacts` and content types. Never import this entry from client UI.
- `@popcornt/qjudge-docs/styles.css`: compiled Carbon documentation styles and packaged IBM Plex fonts. Use it in a standalone docs root; it includes Carbon's global stylesheet and is not a CSS-isolated widget stylesheet.

`DocsLayout` takes product `config`, a resolved `page`, and navigation `entries`. Optional `headerBrand`, `footer` and `children` slots enable focused customizations. It never fetches product APIs or accesses application authentication.

Theme preference is local to the documentation site. The default follows system preference. Mobile theme/language controls are inside the navigation menu. Search uses local static JSON and loads when opened.

## Content conventions

- Use frontmatter `title`, `description`, optional `draft: true`, followed by Markdown.
- Slugs contain letters, numbers, underscores, hyphens, and `/` for nested pages. Duplicate or traversal paths fail the build.
- Only files explicitly supplied by a product enter the source. Drafts are excluded from pages, search and sitemap. Products must also exclude drafts from raw-file copies.
- Translation fallback is visibly marked. Canonical points to the actual content language; alternate links list real translations only.
- Prefer Markdown headings over raw HTML headings so the generated TOC matches the rendered article.
- Markdown/HTML is trusted repository content, never untrusted user input. Mermaid uses strict mode.
- Historical `#/docs/...` links are migrated by the root page in the browser, since fragments are not sent to servers. Unknown legacy slugs are not redirected.

## Publishing and upgrading

```sh
npm run check
npm run verify:package
npm pack -w @popcornt/qjudge-docs
```

The manual `Publish private docs package` workflow runs the full CI suite before publishing from `main` of this private repository. It uses the short-lived Actions `GITHUB_TOKEN` with `packages:write`, then verifies a clean registry installation. New versions require updating the package version and both example dependencies/lockfile first.

Consumers use `@popcornt/qjudge-docs` at an exact version and `.npmrc` scope mapping `@popcornt:registry=https://npm.pkg.github.com`. In Actions, grant the consumer repository read access in the package settings and use `GITHUB_TOKEN` with `packages:read`. If cross-owner access is unavailable, use a dedicated read-only `read:packages` classic PAT stored as a repository secret. Local developers authenticate with their own `read:packages` classic PAT; never commit credentials. GitHub documents authentication at https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry.

The framework source repo is private. Do not commit package tarballs into the public QJudge repository. Fork PRs cannot access private dependencies: run private-package checks only on trusted branches, never expose credentials using `pull_request_target` to execute untrusted PR code.

Upgrade a product with an exact package version and lockfile, build its real content, check preview screenshots/links, then deploy that product independently. Roll back using the previous static deployment artifact and prior lockfile. A framework release does not deploy consumers.

QJudge's integration is in the separate `codex/docs-framework-plan` worktree under `docs-site/`. Its local prototype used a vendored tarball; registry migration must remove that tarball from public branch history. Its original product app's embedded `/docs` remains intact; the new package currently replaces the standalone site's build only.

## Verification status

See `EXECUTION.md`. Local builds and browser checks are separate from remote CI, package publication and production deployment. Business is a framework fixture, not a claim that a commercial product or its docs are released.

## License

MIT. Carbon Markdown renderer/styles derive from QJudge (copyright 2025 quan0715). IBM Plex's font license is included in the built package. Dependencies retain their upstream licenses.

## Internal boundaries

- `content/`: build-time Markdown parsing, page lookup, translation fallback, routes and static artifacts. Node-only dependencies stay here.
- `search/index.ts`: portable JSON contract and pure query ranking, with no React or Markdown dependencies.
- `search/useDocsSearch.ts`: browser loading lifecycle, cancellation and query state.
- `carbon/`: rendering and interaction using Carbon; no content filesystem access.

Search uses normalized, case-insensitive literal matching (including CJK substrings), all query terms must match, and titles rank above descriptions and body text. It returns up to 20 article links. It deliberately does not offer typo tolerance, stemming or section-level results. This keeps the first-party implementation small for our current documentation corpus; benchmark before expanding to large corpora.
