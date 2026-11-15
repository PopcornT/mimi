import { z } from "zod";
const segment = z.string().regex(/^[\p{L}\p{N}_-]+$/u);
export const configSchema = z.object({
  title: z.string().min(1),
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
  return `/${locale}${c.basePath}/${slug.split("/").map(encodeURIComponent).join("/")}/`;
}
export function resolveDocHref(
  c: DocsConfig,
  locale: string,
  slug: string,
  href: string,
): string {
  if (href.startsWith("#/docs/")) {
    const u = new URL(href.slice(7), "https://docs.invalid/");
    return (
      docUrl(c, locale, decodeURIComponent(u.pathname.slice(1))) +
      u.search +
      u.hash
    );
  }
  if (/^(?:[a-z]+:|\/\/|#)/i.test(href) || href.startsWith("/docs/images/"))
    return href;
  if (href.startsWith("/docs/")) {
    const u = new URL(href, "https://docs.invalid");
    return (
      docUrl(
        c,
        locale,
        decodeURIComponent(u.pathname.slice(6).replace(/\/$/, "")),
      ) +
      u.search +
      u.hash
    );
  }
  if (/\.md(?:[?#]|$)/.test(href)) {
    const u = new URL(href, `https://docs.invalid/${slug}`);
    return (
      docUrl(
        c,
        locale,
        decodeURIComponent(u.pathname.slice(1).replace(/\.md$/, "")),
      ) +
      u.search +
      u.hash
    );
  }
  return href;
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
  return route + (query.size ? "?" + query.toString() : "") + u.hash;
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
