# Content engine decision

Updated 2026-11-15: own the documentation framework and remove Fumadocs Core entirely. The earlier 0.1.0 experiment used its source loader and search; 0.2.0 replaces both.

Keep content, search and presentation separate, inspired by the headless boundaries in https://www.fumadocs.dev/docs/headless. No upstream source is copied or forked. Avoid recreating its plugin/provider abstraction: the two products need a simple map-based source and static search data.

Content is parsed once into our DocPage contract. A locale/slug map resolves exact translations and then the configured fallback. Navigation, canonical URLs and static routes remain our own contract. Search artifacts contain plain text extracted from Markdown, one article per entry. Browser search uses Unicode NFKC/case normalization and literal all-term matching, with title/description/body ranking. This handles Chinese substrings without a tokenizer dependency. No typo tolerance, stemming or heading-level result links in this version.

React Router owns static prerendering; Carbon owns UI primitives; remark/rehype own Markdown parsing/rendering. These remain ordinary dependencies, not a documentation framework. MDX stays deferred.

React Router requires prerender paths without a trailing slash, while canonical URLs and static directory URLs retain it. Unknown URLs return HTTP 404 rather than SPA fallback.

QJudge renderer/styles retain their MIT attribution; IBM Plex font license ships inside the package.
