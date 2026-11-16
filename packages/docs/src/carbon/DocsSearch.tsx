import { docsLabels } from "../i18n/labels.js";
import { Search, Link } from "@carbon/react";
import { useDocsSearch } from "../search/useDocsSearch.js";
import type { SearchEntry } from "../search/index.js";
export function DocsSearch({
  locale,
  label,
  entries,
  onSelect,
}: {
  locale: string;
  label: string;
  entries?: SearchEntry[];
  onSelect?: () => void;
}) {
  const { query, setQuery, results, isLoading, error } = useDocsSearch(
    locale,
    entries,
  );
  return (
    <>
      <Search
        id="docs-search-input"
        labelText={label}
        placeholder={label}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="qd-searchResults" aria-live="polite">
        {error && <p role="alert">{docsLabels(locale).searchError}</p>}
        {isLoading && <p>…</p>}
        {results.map((result) => (
          <Link key={result.url} href={result.url} onClick={onSelect}>
            {result.title}
          </Link>
        ))}
        {query.trim() && !error && !isLoading && !results.length && (
          <p>{docsLabels(locale).empty}</p>
        )}
      </div>
    </>
  );
}
