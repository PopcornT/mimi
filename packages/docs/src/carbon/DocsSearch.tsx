import { docsLabels } from "../i18n/labels.js";
import { Search, Link } from "@carbon/react";
import { useStaticSearch } from "fumadocs-core/search/client";
export function DocsSearch({
  locale,
  label,
}: {
  locale: string;
  label: string;
}) {
  const { search, onSearchChange, data, isLoading, error } = useStaticSearch({
    from: `/search-index.${locale}.json`,
  });
  return (
    <>
      <Search
        id="docs-search-input"
        labelText={label}
        placeholder={label}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="qd-searchResults" aria-live="polite">
        {error && <p role="alert">{docsLabels(locale).searchError}</p>}
        {isLoading && <p>…</p>}
        {data?.items.map((r) =>
          r.type !== "table" ? (
            <Link key={r.id} href={r.url}>
              {r.content}
            </Link>
          ) : null,
        )}
        {data && !isLoading && !data.items.length && (
          <p>{docsLabels(locale).empty}</p>
        )}
      </div>
    </>
  );
}
