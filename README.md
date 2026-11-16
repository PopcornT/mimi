# Mimi

A Carbon-based documentation framework for independently deployed product documentation. Mimi owns its content loader and multilingual static search; it has no Fumadocs dependency.

## Development

Node 24 and npm are recommended (minimum Node 22.12).

```sh
npm ci
npm run check
npm run verify:package
```

The check builds the package before typechecking consumers, then builds both examples and runs unit/static/browser tests. Browser tests use installed Chrome locally and Playwright Chromium in CI. Tarball verification installs both example consumers in fresh directories and checks required license files.

## Using Mimi

The intended public npm package is `@popcornt/mimi`; the first publication is pending npm account authorization. Start from `examples/business` or `examples/education`, configure `docs.config.json`, and supply Markdown files. Each product owns content, images, navigation, branding, domain and deployment. Pin an exact package version with a lockfile.

- `@popcornt/mimi`: Carbon DocsLayout, MarkdownRenderer and configuration utilities.
- `@popcornt/mimi/content`: build/server-only content source and static artifact generation.
- `@popcornt/mimi/styles.css`: compiled Carbon styles and packaged IBM Plex fonts. This includes global styles, not an isolated widget stylesheet.

The React Router examples generate `build/client` for static hosting. Serve `404.html` with HTTP 404 rather than using an SPA fallback. Deploy generated HTML and search indexes together. Historical hash URLs are migrated client-side; canonical URLs use `/<locale>/docs/<slug>/`.

## Architecture and content

- `content/`: Markdown parsing, locale/slug lookup, translation fallback, routes and build artifacts.
- `search/index.ts`: portable search JSON contract and pure ranking without React or parser dependencies.
- `search/useDocsSearch.ts`: browser fetch/cancellation and query state.
- `carbon/`: presentation and interactions without filesystem access.

Search supports Unicode-normalized, case-insensitive literal matching and CJK substrings. All query terms must match; titles rank above descriptions and body text. Up to 20 article links are returned. Typo tolerance, stemming and section-level results are not implemented.

Use frontmatter title/description and optional `draft: true`. Only explicitly supplied content is published. Drafts are omitted from generated pages and search; consumers must also exclude drafts from raw-file copies. Translation fallback is visibly marked; canonical URLs and alternate links identify actual translations. Markdown/HTML is trusted repository content, not untrusted user input. Mermaid uses strict mode. MDX is deferred.

## Releases

The first npm publication requires a maintainer with access to the npm `popcornt` scope. GitHub organization ownership does not grant npm scope ownership.

After first publication, configure npm Trusted Publisher: owner `PopcornT`, repository `mimi`, workflow `release.yml`. The manual workflow runs full CI, publishes from main using OIDC and provenance, then verifies anonymous installation. No long-lived npm token is stored in this repo. See https://docs.npmjs.com/trusted-publishers/.

A framework release does not deploy consuming products. Upgrade one consumer at a time, build its actual content, verify links and UI, and retain the prior static deployment artifact for rollback. The existing QJudge app's embedded docs remain independent; standalone-site migration is separate.

## License

Mimi's original code is MIT. The initial renderer/layout derives from QJudge, copyright 2025 quan0715; the notice is retained. Carbon components/styles/icons remain Apache-2.0; IBM Plex fonts remain OFL-1.1. Their license files and third-party notices ship in the package. Mimi is independently maintained, not an IBM official product.
