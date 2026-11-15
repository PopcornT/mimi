# Content engine decision

Use Fumadocs Core 16.19.3 for source loading and static full-text search, with React Router 7.18.2 for static prerendering. Preserve QJudge's Carbon React 1.96.0 renderer and article layout.

Verified: both fixtures build static HTML; Chinese search works without a backend; no hydration errors in Chrome; Markdown images and tables render. Source baseline: QJudge a37e2e64a (PR #484), docs tests 14/14.

Do not install Fumadocs UI. Do not fork Fumadocs. Markdown uses react-markdown/remark/rehype and the existing Carbon renderer. MDX is deferred: neither initial consumer requires executable MDX, and introducing a second compiler would create migration risk for existing raw HTML. This is a deliberate narrower first release than the original candidate architecture.

React Router requires prerender paths without a trailing slash, while canonical URLs and static directory URLs retain it. Both forms resolve on the static host. Unknown URLs must return HTTP 404 rather than SPA fallback.

Upstream sources:
- https://www.fumadocs.dev/docs/headless
- https://github.com/fuma-nama/fumadocs/blob/dev/apps/docs/content/docs/(framework)/deploying/static.mdx
- https://starlight.astro.build/guides/overriding-components/

No upstream source was copied. QJudge renderer/styles copied under its MIT license, retained in LICENSE. IBM Plex font license ships inside the package.
