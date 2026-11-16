import { z } from "zod";
const segment = z.string().regex(/^[\p{L}\p{N}_-]+$/u);
export const configSchema = z.object({
  title: z.string().min(1),
  defaultDoc: z.string().default("overview"),
  routing: z.enum(["locale-path", "query"]).default("locale-path"),
  feedback: z.boolean().default(false),
  quickLinks: z
    .array(
      z.object({
        id: z.string(),
        icon: z.string().optional(),
        items: z.array(z.string()).min(1),
        title: z.record(z.string(), z.string()),
        description: z.record(z.string(), z.string()).default({}),
        tag: z.record(z.string(), z.string()).default({}),
        tagType: z
          .enum(["blue", "purple", "green", "magenta", "gray"])
          .default("blue"),
      }),
    )
    .default([]),
  siteUrl: z.url(),
  basePath: z.string().default("/docs"),
  defaultLocale: segment,
  fallbackLocale: segment,
  locales: z.array(segment).min(1),
  navigation: z.array(
    z.object({
      title: z.string(),
      labels: z.record(z.string(), z.string()).optional(),
      icon: z.string().optional(),
      items: z.array(z.string()),
    }),
  ),
  brand: z
    .object({ logo: z.string().optional(), homeHref: z.string().optional() })
    .default({}),
  theme: z.enum(["white", "g10", "g90", "g100"]).default("white"),
});
export type DocsConfig = z.infer<typeof configSchema>;
export function defineDocsConfig(
  input: z.input<typeof configSchema>,
): DocsConfig {
  const c = configSchema.parse(input);
  if (
    !c.locales.includes(c.defaultLocale) ||
    !c.locales.includes(c.fallbackLocale)
  )
    throw new Error("Default and fallback locales must be enabled");
  if (new Set(c.locales).size !== c.locales.length)
    throw new Error("Duplicate locale");
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(c.basePath) || c.basePath.includes("//"))
    throw new Error("Invalid basePath");
  if (!/^https?:$/.test(new URL(c.siteUrl).protocol))
    throw new Error("siteUrl must use HTTP(S)");
  c.siteUrl = c.siteUrl.replace(/\/$/, "");
  c.basePath = c.basePath.replace(/\/$/, "");
  return c;
}

export function docUrl(c: DocsConfig, locale: string, slug: string) {
  const encoded = slug.split("/").map(encodeURIComponent).join("/");
  return c.routing === "query"
    ? `${c.basePath}/${encoded}?lang=${encodeURIComponent(locale)}`
    : `/${locale}${c.basePath}/${encoded}/`;
}
function withLocation(base: string, search: string, hash: string) {
  const url = new URL(base, "https://docs.invalid");
  for (const [key, value] of new URLSearchParams(search))
    url.searchParams.set(key, value);
  url.hash = hash;
  return url.pathname + url.search + url.hash;
}
export function resolveDocHref(
  c: DocsConfig,
  locale: string,
  slug: string,
  href: string,
): string {
  let target: URL;
  if (href.startsWith("#/docs/"))
    target = new URL(href.slice(7), "https://docs.invalid/");
  else if (
    /^(?:[a-z]+:|\/\/|#)/i.test(href) ||
    href.startsWith("/docs/images/")
  )
    return href;
  else if (href.startsWith("/docs/"))
    target = new URL(href.slice(6), "https://docs.invalid/");
  else if (/\.md(?:[?#]|$)/.test(href))
    target = new URL(href, `https://docs.invalid/${slug}`);
  else return href;
  return withLocation(
    docUrl(
      c,
      locale,
      decodeURIComponent(
        target.pathname.slice(1).replace(/\.md$/, "").replace(/\/$/, ""),
      ),
    ),
    target.search,
    target.hash,
  );
}
export function resolveLegacyUrl(
  c: DocsConfig,
  hash: string,
  search: string,
  routes: string[],
): string | undefined {
  if (!hash.startsWith("#/docs/")) return undefined;
  const u = new URL(hash.slice(7), "https://docs.invalid/");
  const query = new URLSearchParams(search);
  for (const [key, value] of u.searchParams) query.set(key, value);
  const requested = query.get("lang") || c.defaultLocale;
  const locale = c.locales.includes(requested) ? requested : c.defaultLocale;
  let slug: string;
  try {
    slug = decodeURIComponent(u.pathname.slice(1));
  } catch {
    return undefined;
  }
  const route = docUrl(c, locale, slug);
  if (!routes.includes(route)) return undefined;
  return withLocation(route, query.toString(), u.hash);
}
export function resolveDocsTheme(
  theme: DocsConfig["theme"],
  mode: string,
  systemDark: boolean,
): DocsConfig["theme"] {
  const subtle = theme === "g10" || theme === "g90";
  return mode === "dark" || (mode === "system" && systemDark)
    ? subtle
      ? "g90"
      : "g100"
    : subtle
      ? "g10"
      : "white";
}
