# Execution ledger

## 0.1.0 history (superseded by the 0.2.0 decision below)

Base: QJudge a37e2e64a. Original checkout untouched.

Task 1: completed locally. Independent local repo.
Ruling: start with Fumadocs Core source loader and existing Markdown renderer; evaluate MDX separately so existing raw HTML and Carbon rendering remain compatible. No Fumadocs UI.
Ruling: use React Router 7.18.2 (current QJudge major) and compatible Vite 8.3.6; do not upgrade to router 8 as part of extraction.

Task 1: Fumadocs Core 16.19.3 source loader + static search proven with React Router 7.18.2 prerender and Carbon React 1.96.0. Both sample sites build. Baseline QJudge docs tests 14/14 passed.
Task 2: 7 content tests pass. Heading-link anchor regression observed RED then GREEN using remark AST.
Task 4: static output tests initially failed (missing HTML), now 2/2 pass. Trailing-slash prerender paths normalized for React Router.
Ruling: existing Markdown renderer retained; MDX deferred until an actual consumer needs executable article components, avoiding a second parsing pipeline.

Task 3: Carbon desktop/mobile checked in Chrome; search focus-return regression RED->GREEN. No hydration errors. Four UI languages retained; translated navigation labels are consumer data.
Task 5: two tarballs installed into independent temporary consumers and built successfully. CI/release artifact workflows added, not run remotely.
Task 6: docs-site in QJudge worktree consumes a vendored tarball; static generation initially produced 80 pages. Expanded source to all explicitly public Markdown to preserve direct-link articles outside the sidebar; draft raw files excluded. Existing missing teacher-overview links in ja/ko corrected. Original embedded product docs remain in place until independently migrated.
Final review: independent agent identified three Important findings, no Critical. Heading offset and Carbon dark-base/light-toggle regressions reproduced; fixes added with tests. Unicode double encoding reproduced and fixed with a unit regression.
Ruling: package release workflow prepares an artifact, without registry publication, because scope/registry is not configured. QJudge consumes a pinned vendored tarball for reproducible CI; replace with registry version after publication.
Ruling: static standalone site migration first; embedded app docs retain existing code, avoiding a product dependency upgrade outside this standalone extraction. Cost: temporary duplicated UI until embedded migration is separately validated.
Ruling: all frontend/public/docs Markdown remains public as before, including direct-link articles outside sidebar. Source is this explicitly public directory, not the repository docs directory.

Final local verification (2026-11-15): `npm run check` passed: typecheck, package build, both example builds, 14 unit/static tests and 5 browser tests. `npm run verify:package` installed and built both consumers from the canonical `output/packages/qjudge-docs-0.1.0.tgz` artifact. Installed package bytes and consumer lockfile integrity match the final artifact.
QJudge integration: typecheck/build passed; 115 static article pages passed metadata, local link and asset checks. Real-content desktop/mobile, search, Japanese labels and unknown-route 404 browser checks passed with zero page errors. Desktop/mobile screenshots inspected.
Additional regression: unknown routes on a pure static host hydrated the generated 404 with the wrong route. Reproduced with a failing static test, then stripped scripts/modulepreloads from the fallback 404; the final browser check passed.
Delivery boundary: framework and QJudge changes are local only. Remote CI, registry publication, Cloudflare production deployment and commercial-repository integration remain unperformed. Business example is a working fixture; actual product repository location is still needed. Existing embedded app docs remain intact.

## 0.2.0: independent framework (2026-11-15)

User requested complete removal of Fumadocs while keeping the architecture clean. Replaced its source loader with a locale/slug map and its search with our own portable static JSON contract, pure multilingual matching, and a small React fetch lifecycle. Carbon presentation remains separate. No Fumadocs package remains in either dependency lockfile; 30 installed packages were removed. See `docs/decisions/001-content-engine.md` for the current decision.

Search regression test observed failing before replacement, then passed. Final framework check: typecheck, both example builds, 15 unit/static tests, 6 browser tests passed. Both separately installed tarball consumers built. QJudge typecheck/build and 115 article metadata/link/asset checks passed; installed dist bytes and tarball lock integrity match. A local Node measurement over 28 Traditional Chinese entries (143 KB JSON) averaged 0.35 ms per query over 100 runs; this is not a mobile-browser benchmark.

Independent review found no Important/Critical issues; historical rulings above are now explicitly marked superseded. Literal all-term matching supports CJK substrings and normalized English; typo tolerance, stemming and section results are deliberately not included. Search indexes and HTML must be rebuilt/deployed together because the index format changed. Registry publication and production deployment remain unperformed.

Final real-content Chrome check passed: desktop/mobile layout, Chinese search, Japanese UI and unknown-route 404, with zero page errors. Local QJudge (4319) and Business (4318) previews serve the rebuilt 0.2.0 output.
