import { useEffect, useMemo, useState } from "react";
import { searchDocs, type SearchEntry } from "./index.js";

/** Fetch when the search UI mounts; abort on close or language changes. */
export function useDocsSearch(locale: string) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<{
    locale: string;
    index?: SearchEntry[];
    error?: Error;
  }>({ locale });
  useEffect(() => {
    const controller = new AbortController();
    setState({ locale });
    fetch(`/search-index.${encodeURIComponent(locale)}.json`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Search index: ${response.status}`);
        return response.json() as Promise<SearchEntry[]>;
      })
      .then((index) => {
        if (!controller.signal.aborted) setState({ locale, index });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ locale, error });
      });
    return () => controller.abort();
  }, [locale]);
  const index = state.locale === locale ? state.index : undefined;
  const error = state.locale === locale ? state.error : undefined;
  const results = useMemo(
    () => (index ? searchDocs(index, query) : []),
    [index, query],
  );
  return { query, setQuery, results, error, isLoading: !index && !error };
}
