# QJudge Carbon Docs

A reusable Carbon documentation package for QJudge's own product lines. Fumadocs Core supplies content indexing and static search; React Router prerenders pages; the UI retains QJudge's Carbon layout and Markdown components.

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
- One package (`@qjudge/docs`), pinned independently by each product. Its registry location is not configured yet; no public package exists from this work.

Start from `examples/business`. Configure `docs.config.json`, add files to `content/<locale>/<slug>.md`, then build with React Router. It emits `build/client`, suitable for static hosting. Configure your host to serve its `404.html` with HTTP 404; do not turn all unknown URLs into an SPA fallback.

The examples use simple explicit route modules rather than an additional custom CLI. Fumadocs UI and Next.js are not required. Only Markdown is supported in this first release; MDX is deferred.

## Package API

- `@qjudge/docs`: `DocsLayout`, `MarkdownRenderer`, `defineDocsConfig`, `resolveLegacyUrl`, public types.
- `@qjudge/docs/content`: build/server-only `createDocsSource`, `writeDocsArtifacts` and content types. Never import this entry from client UI.
- `@qjudge/docs/styles.css`: compiled Carbon documentation styles and packaged IBM Plex fonts. Use it in a standalone docs root; it includes Carbon's global stylesheet and is not a CSS-isolated widget stylesheet.

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
npm pack -w @qjudge/docs
```

The release workflow creates a downloadable tarball only. Before registry publishing, choose a package scope/registry and configure credentials via CI secrets. The `@qjudge` name is provisional, not a claim of registry ownership.

Upgrade a product with an exact package version and lockfile, build its real content, check preview screenshots/links, then deploy that product independently. Roll back using the previous static deployment artifact and prior lockfile. A framework release does not deploy consumers.

QJudge's integration is in the separate `codex/docs-framework-plan` worktree under `docs-site/`. It uses a vendored prerelease tarball until registry publication is configured. Its original product app's embedded `/docs` remains intact; the new package currently replaces the standalone site's build only.

## Verification status

See `EXECUTION.md`. Local builds and browser checks are separate from remote CI, package publication and production deployment. Business is a framework fixture, not a claim that a commercial product or its docs are released.

## License

MIT. Carbon Markdown renderer/styles derive from QJudge (copyright 2025 quan0715). IBM Plex's font license is included in the built package. Dependencies retain their upstream licenses.
