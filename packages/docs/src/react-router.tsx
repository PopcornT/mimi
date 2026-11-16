import { useEffect, useMemo, type ReactNode, type MouseEvent } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router";
import { DocsLayout, type DocsLayoutProps } from "./carbon/DocsLayout.js";
import {
  createDocsIndex,
  type DocsSnapshot,
  type DocsSource,
} from "./source.js";
import { docUrl, resolveLegacyUrl } from "./config.js";
import { docsLabels } from "./i18n/labels.js";

export function loadDocsPage(
  source: DocsSource,
  params: Record<string, string | undefined>,
) {
  const locale = params.locale || source.config.defaultLocale;
  const slug = (params["*"] || params.slug || source.config.defaultDoc).replace(
    /\/$/,
    "",
  );
  const page = source.loadDoc({ locale, slug });
  if (!page) throw new Response("Not found", { status: 404 });
  return {
    page,
    config: source.config,
    entries: source
      .searchEntries(locale)
      .map(({ title, url, slug }) => ({ title, url, slug })),
    availableLocales: source.config.locales.filter((locale) =>
      source.loadDoc({ locale, slug }),
    ),
    alternates: source
      .pages()
      .filter((p) => p.slug === slug)
      .map((p) => ({ locale: p.contentLocale, url: p.canonicalUrl })),
  };
}
export function loadDocsHome(source: DocsSource) {
  return { ...loadDocsPage(source, {}), routes: source.routes() };
}
export function docsMeta({
  data,
}: {
  data: ReturnType<typeof loadDocsPage> | undefined;
}) {
  if (!data) return [{ title: "404" }];
  return [
    { title: `${data.page.title} | ${data.config.title}` },
    { name: "description", content: data.page.description || data.page.title },
    { tagName: "link", rel: "canonical", href: data.page.canonicalUrl },
    ...data.alternates.map((a) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: a.locale,
      href: a.url,
    })),
  ];
}
export function DocsArticle() {
  return <DocsLayout {...useLoaderData<typeof loadDocsPage>()} />;
}
export function DocsHome() {
  const data = useLoaderData<typeof loadDocsHome>();
  useEffect(() => {
    const target = resolveLegacyUrl(
      data.config,
      window.location.hash,
      window.location.search,
      data.routes,
    );
    if (target) window.location.replace(target);
  }, [data]);
  return <DocsLayout {...data} />;
}

/** Embedded in an existing BrowserRouter. Article parsing stays at build time. */
export function DocsApplication({
  data,
  locale: preferredLocale,
  headerBrand,
  homeHref = "/",
  themePreference,
  onThemeChange,
  onLocaleChange,
}: {
  data: DocsSnapshot;
  locale?: string;
  headerBrand?: ReactNode;
  homeHref?: string;
} & Pick<
  DocsLayoutProps,
  "themePreference" | "onThemeChange" | "onLocaleChange"
>) {
  const source = useMemo(() => createDocsIndex(data), [data]);
  const location = useLocation();
  const navigate = useNavigate();
  const requested =
    new URLSearchParams(location.search).get("lang") ||
    preferredLocale ||
    data.config.defaultLocale;
  const locale = data.config.locales.includes(requested)
    ? requested
    : data.config.defaultLocale;
  const config = useMemo(
    () => ({
      ...data.config,
      routing: "query" as const,
      brand: { ...data.config.brand, homeHref },
    }),
    [data, homeHref],
  );
  let slug = location.pathname
    .slice(config.basePath.length)
    .replace(/^\/|\/$/g, "");
  try {
    slug = decodeURIComponent(slug);
  } catch {
    slug = "%invalid";
  }
  const defaultSlug = config.defaultDoc;
  const page = source.loadDoc({ locale, slug: slug || defaultSlug });
  const entries = useMemo(
    () =>
      source.searchEntries(locale).map((p) => ({
        ...p,
        url: docUrl(config, locale, p.slug),
        text: p.searchText ?? p.body,
      })),
    [source, config, locale],
  );
  useEffect(() => {
    const routes = data.config.locales.flatMap((lang) =>
      source.searchEntries(lang).map((p) => docUrl(config, lang, p.slug)),
    );
    const legacy = resolveLegacyUrl(
      config,
      location.hash,
      location.search,
      routes,
    );
    if (legacy) navigate(legacy, { replace: true });
    else if (!slug)
      navigate(docUrl(config, locale, defaultSlug), { replace: true });
  }, [
    config,
    source,
    data,
    location.hash,
    location.search,
    locale,
    slug,
    defaultSlug,
    navigate,
  ]);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      if (location.hash && !location.hash.startsWith("#/")) {
        try {
          document
            .getElementById(decodeURIComponent(location.hash.slice(1)))
            ?.scrollIntoView();
        } catch {}
      } else window.scrollTo(0, 0);
    });
    return () => window.cancelAnimationFrame(id);
  }, [location.pathname, location.hash]);
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest("a");
    if (
      !link ||
      (link.target && link.target !== "_self") ||
      link.hasAttribute("download") ||
      link.getAttribute("href")?.startsWith("#")
    )
      return;
    const url = new URL(link.href);
    if (
      url.origin === window.location.origin &&
      (url.pathname === config.basePath ||
        url.pathname.startsWith(config.basePath + "/"))
    ) {
      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    }
  };
  if (!page)
    return (
      <main className="qd-root">
        <h1>{docsLabels(locale).notFound}</h1>
        <a href={docUrl(config, locale, defaultSlug)}>{config.title}</a>
      </main>
    );
  return (
    <div onClickCapture={onClick}>
      <title>
        {page.title} | {config.title}
      </title>
      <link rel="canonical" href={page.canonicalUrl} />
      <DocsLayout
        key={`${locale}/${page.slug}`}
        themePreference={themePreference}
        onThemeChange={onThemeChange}
        onLocaleChange={onLocaleChange}
        config={config}
        page={page}
        entries={entries}
        searchEntries={entries}
        navigate={navigate}
        headerBrand={headerBrand}
        availableLocales={data.config.locales.filter((lang) =>
          source.loadDoc({ locale: lang, slug: page.slug }),
        )}
      />
    </div>
  );
}
