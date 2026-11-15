/** Portable static search data; independent of React and the content parser. */
export interface SearchEntry {
  title: string;
  url: string;
  text: string;
  description?: string;
}
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();

/** Literal multilingual matching for small documentation sites. All terms must match. */
export function searchDocs(index: SearchEntry[], query: string): SearchEntry[] {
  const terms = [
    ...new Set(normalize(query).trim().split(/\s+/).filter(Boolean)),
  ];
  if (!terms.length) return [];
  return index
    .map((entry) => {
      const title = normalize(entry.title);
      const description = normalize(entry.description ?? "");
      const text = normalize(entry.text);
      const score = terms.every((term) =>
        `${title}\n${description}\n${text}`.includes(term),
      )
        ? terms.reduce(
            (sum, term) =>
              sum +
              (title.includes(term) ? 10 : description.includes(term) ? 3 : 1),
            0,
          )
        : 0;
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.url.localeCompare(b.entry.url))
    .slice(0, 20)
    .map((result) => result.entry);
}
