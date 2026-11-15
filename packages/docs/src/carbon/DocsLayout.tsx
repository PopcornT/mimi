import {
  ArrowRight,
  Search as SearchIcon,
  DocumentBlank,
  Document,
  Rocket,
  BareMetalServer,
  UserAdmin,
} from "@carbon/icons-react";
import { docsLabels } from "../i18n/labels.js";
import { useEffect, useState, useRef, type ReactNode } from "react";
import {
  Theme,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderMenuButton,
  Dropdown,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  Modal,
  Link,
  InlineNotification,
  Button,
} from "@carbon/react";
import type { DocsConfig } from "../config.js";
import type { DocPage } from "../content/index.js";
import { docUrl, resolveDocHref, resolveDocsTheme } from "../config.js";
import { DocsSearch } from "./DocsSearch.js";
import MarkdownRenderer from "./MarkdownRenderer.js";

export interface DocsLayoutProps {
  config: DocsConfig;
  page: DocPage;
  entries: Pick<DocPage, "title" | "url" | "slug">[];
  children?: ReactNode;
  footer?: ReactNode;
  headerBrand?: ReactNode;
  availableLocales?: string[];
}
export function DocsLayout({
  config,
  page,
  entries,
  children,
  footer,
  headerBrand,
  availableLocales = config.locales,
}: DocsLayoutProps) {
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mode, setMode] = useState("system");
  const [dark, setDark] = useState(false);
  const label = docsLabels(page.requestedLocale);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(media.matches);
    update();
    media.addEventListener("change", update);
    try {
      setMode(localStorage.getItem(`docs-theme:${config.title}`) || "system");
    } catch {}
    return () => media.removeEventListener("change", update);
  }, [config.title]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const theme = resolveDocsTheme(config.theme, mode, dark);
  const icons: Record<string, typeof DocumentBlank> = {
    rocket: Rocket,
    server: BareMetalServer,
    document: Document,
    admin: UserAdmin,
    "document-blank": DocumentBlank,
  };
  const nav = (
    <SideNavItems>
      {config.navigation.map((section) => (
        <SideNavMenu
          key={section.title}
          title={section.labels?.[page.requestedLocale] || section.title}
          defaultExpanded={section.items.includes(page.slug)}
          isActive={section.items.includes(page.slug)}
          renderIcon={icons[section.icon || "document-blank"] || DocumentBlank}
        >
          {section.items.map((slug) => (
            <SideNavMenuItem
              key={slug}
              href={docUrl(config, page.requestedLocale, slug)}
              isActive={slug === page.slug}
            >
              {entries.find((e) => e.slug === slug)?.title || slug}
            </SideNavMenuItem>
          ))}
        </SideNavMenu>
      ))}
    </SideNavItems>
  );
  return (
    <Theme theme={theme} className="qd-root">
      <a className="qd-skip" href="#docs-content">
        {label.skip}
      </a>
      <Header aria-label={config.title}>
        <HeaderMenuButton
          className="qd-menuToggle"
          aria-label={label.menu}
          isActive={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        />
        <HeaderName
          className="qd-headerBrand"
          href={
            config.brand.homeHref ||
            docUrl(
              config,
              config.defaultLocale,
              config.navigation[0]?.items[0] || "overview",
            )
          }
          prefix=""
        >
          {headerBrand ?? (
            <>
              {config.brand.logo && (
                <img className="qd-logo" src={config.brand.logo} alt="" />
              )}
              {config.title}
            </>
          )}
        </HeaderName>
        <HeaderGlobalBar className="qd-headerActions">
          <Button
            ref={searchTrigger}
            kind="ghost"
            size="sm"
            hasIconOnly
            tooltipAlignment="end"
            tooltipPosition="bottom"
            renderIcon={SearchIcon}
            iconDescription={label.search}
            className="qd-searchLink"
            onClick={() => setSearchOpen(true)}
          >
            {label.search}
          </Button>
          <div className="qd-headerSettings">
            {" "}
            <Dropdown
              id="docs-language"
              hideLabel
              type="inline"
              size="sm"
              titleText={label.language}
              label={page.requestedLocale}
              items={availableLocales}
              itemToString={(v) =>
                ({
                  "zh-TW": "繁體中文",
                  en: "English",
                  ja: "日本語",
                  ko: "한국어",
                })[v || ""] ||
                v ||
                ""
              }
              selectedItem={page.requestedLocale}
              onChange={({ selectedItem }) => {
                if (selectedItem)
                  window.location.assign(
                    docUrl(config, selectedItem, page.slug),
                  );
              }}
            />
            <Dropdown
              id="docs-theme"
              hideLabel
              type="inline"
              size="sm"
              titleText={label.theme}
              label={mode}
              items={["system", "light", "dark"]}
              selectedItem={mode}
              itemToString={(v) =>
                ({
                  system: label.system,
                  light: label.light,
                  dark: label.dark,
                })[v || "system"] || ""
              }
              onChange={({ selectedItem }) => {
                if (selectedItem) {
                  setMode(selectedItem);
                  try {
                    localStorage.setItem(
                      `docs-theme:${config.title}`,
                      selectedItem,
                    );
                  } catch {}
                }
              }}
            />
          </div>
        </HeaderGlobalBar>
      </Header>
      <div className="qd-container">
        <nav
          className={`qd-leftSidebar ${mobileOpen ? "qd-mobileOpen" : ""}`}
          aria-label={label.menu}
        >
          <div className="qd-sidebarBrand">{config.title}</div>
          {nav}
          <div className="qd-mobileSettings">
            {" "}
            <Dropdown
              id="mobile-docs-language"
              hideLabel
              type="inline"
              size="sm"
              titleText={label.language}
              label={page.requestedLocale}
              items={availableLocales}
              itemToString={(v) =>
                ({
                  "zh-TW": "繁體中文",
                  en: "English",
                  ja: "日本語",
                  ko: "한국어",
                })[v || ""] ||
                v ||
                ""
              }
              selectedItem={page.requestedLocale}
              onChange={({ selectedItem }) => {
                if (selectedItem)
                  window.location.assign(
                    docUrl(config, selectedItem, page.slug),
                  );
              }}
            />
            <Dropdown
              id="mobile-docs-theme"
              hideLabel
              type="inline"
              size="sm"
              titleText={label.theme}
              label={mode}
              items={["system", "light", "dark"]}
              selectedItem={mode}
              itemToString={(v) =>
                ({
                  system: label.system,
                  light: label.light,
                  dark: label.dark,
                })[v || "system"] || ""
              }
              onChange={({ selectedItem }) => {
                if (selectedItem) {
                  setMode(selectedItem);
                  try {
                    localStorage.setItem(
                      `docs-theme:${config.title}`,
                      selectedItem,
                    );
                  } catch {}
                }
              }}
            />
          </div>
        </nav>
        <main className="qd-mainArea" id="docs-content" tabIndex={-1}>
          <div className="qd-pageHeader">
            <h1 className="qd-pageTitle">{page.title}</h1>
            {page.description && <p>{page.description}</p>}
          </div>
          <div className="qd-contentArea">
            <article className="qd-mainContent">
              {page.requestedLocale !== page.contentLocale && (
                <InlineNotification
                  kind="info"
                  lowContrast
                  hideCloseButton
                  title={label.unavailable}
                  subtitle={`${label.showing} ${page.contentLocale}`}
                />
              )}
              <div lang={page.contentLocale}>
                {children ?? (
                  <MarkdownRenderer
                    resolveLink={(href) =>
                      resolveDocHref(
                        config,
                        page.requestedLocale,
                        page.slug,
                        href,
                      )
                    }
                    enableMath
                    enableHighlight
                    enableCopy
                    enableMermaid
                    allowRawHtml
                  >
                    {page.body}
                  </MarkdownRenderer>
                )}
              </div>
              {footer && <footer>{footer}</footer>}
            </article>
            <aside className="qd-rightSidebar" aria-label={label.toc}>
              <div className="qd-toc qd-tocNav">
                <p className="qd-tocHeading">{label.toc}</p>
                <div className="qd-tocList">
                  {page.toc
                    .filter((h) => h.level <= 3)
                    .map((h) => (
                      <Button
                        kind="ghost"
                        size="sm"
                        className={`qd-tocItem ${h.level === 3 ? "qd-tocItemNested" : ""}`}
                        key={h.id}
                        href={"#" + h.id}
                      >
                        {h.level === 3 && <ArrowRight size={14} />}
                        <span>{h.text}</span>
                      </Button>
                    ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
      <Modal
        launcherButtonRef={searchTrigger}
        open={searchOpen}
        passiveModal
        modalHeading={label.search}
        onRequestClose={() => setSearchOpen(false)}
        selectorPrimaryFocus="#docs-search-input"
        preventCloseOnClickOutside
      >
        {searchOpen && (
          <DocsSearch locale={page.requestedLocale} label={label.search} />
        )}
      </Modal>
    </Theme>
  );
}
