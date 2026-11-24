// Pure, framework-free search / sort / pagination over an in-memory product list.
// No I/O and no React here, so it is trivial to unit test.

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best match' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Rating: highest first' },
  { value: 'title-asc', label: 'Name: A to Z' },
];
export const DEFAULT_SORT = 'relevance';

/** Lower-cases, trims and collapses whitespace. */
export const normaliseQuery = (q) => q.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Every search word must appear somewhere (AND match).
 * Score: title-prefix 3, title 2, other fields 1 — used for "Best match" ordering.
 */
function scoreProduct(product, terms) {
  const { title, other } = product.searchText;
  let score = 0;
  for (const term of terms) {
    if (title.startsWith(term) || title.includes(` ${term}`)) score += 3;
    else if (title.includes(term)) score += 2;
    else if (other.includes(term)) score += 1;
    else return 0; // term missing → not a match
  }
  return score;
}

export function searchProducts(products, query) {
  const q = normaliseQuery(query);
  if (!q) return products.map((product) => ({ product, score: 0 }));
  const terms = q.split(' ');
  const results = [];
  for (const product of products) {
    const score = scoreProduct(product, terms);
    if (score > 0) results.push({ product, score });
  }
  return results;
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const effectivePrice = (p) => p.price * (1 - p.discountPercentage / 100);

const COMPARATORS = {
  // Stable sort keeps the API's original order as the tiebreaker.
  relevance: (a, b) => b.score - a.score,
  'price-asc': (a, b) => effectivePrice(a.product) - effectivePrice(b.product),
  'price-desc': (a, b) => effectivePrice(b.product) - effectivePrice(a.product),
  'rating-desc': (a, b) => b.product.rating - a.product.rating,
  'title-asc': (a, b) => collator.compare(a.product.title, b.product.title),
};

export function sortResults(results, sort) {
  const compare = COMPARATORS[sort] ?? COMPARATORS[DEFAULT_SORT];
  return [...results].sort(compare).map((r) => r.product);
}

export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages };
}
