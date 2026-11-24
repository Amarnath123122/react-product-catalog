import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import SortSelect from './components/SortSelect';
import { EmptyState, ErrorMessage, LoadingSkeleton } from './components/StatusViews';
import { PAGE_SIZE, useProducts } from './hooks/useProducts';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { DEFAULT_SORT, SORT_OPTIONS, normaliseQuery } from './services/productQuery';

const SITE_TITLE = 'Product Catalog | Product Explorer';
// Filtering is local, so a short delay keeps typing smooth without feeling laggy.
const SEARCH_DEBOUNCE_MS = 250;

// Composition root: page layout + wiring hooks to presentational components.
export default function App() {
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);

  // Only the debounced, normalised value drives filtering: typing "laptop" runs
  // one search pass (and one re-render of the grid) instead of six.
  const query = normaliseQuery(useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS));
  const isTyping = normaliseQuery(searchInput) !== query;

  const { products, status, error, page, totalPages, total, hasNext, hasPrev, goNext, goPrev, goFirst, retry } =
    useProducts({ query, sort });

  const headingRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    document.title = [query && `“${query}”`, page > 1 && `Page ${page}`, SITE_TITLE].filter(Boolean).join(' – ');
  }, [page, query]);

  // Move focus/scroll to the list on page change (not on search, so typing isn't interrupted).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [page]);

  const clearSearch = () => setSearchInput('');
  const firstItem = (page - 1) * PAGE_SIZE + 1;
  const lastItem = (page - 1) * PAGE_SIZE + products.length;

  return (
    <div className="layout">
      <a href="#products-heading" className="skip-link">Skip to products</a>
      <Header />

      <main id="main" className="container">
        <div className="toolbar">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            isPending={isTyping}
          />
          <SortSelect value={sort} options={SORT_OPTIONS} onChange={setSort} />
        </div>

        <section aria-labelledby="products-heading">
          <div className="section-head">
            <h2 id="products-heading" ref={headingRef} tabIndex={-1}>
              {query ? 'Search results' : 'Products'}
            </h2>
            {status === 'success' && (
              <span className="section-head__meta">
                {firstItem}–{lastItem} of {total}
              </span>
            )}
          </div>

          {/* Polite live region: announces the outcome of each load to screen readers. */}
          <p className="sr-only" role="status" aria-live="polite">
            {status === 'success' &&
              `${query ? `${total} results for ${query}. ` : ''}Showing products ${firstItem} to ${lastItem} of ${total}, page ${page} of ${totalPages}.`}
            {status === 'empty' && (query ? `No results for ${query}.` : 'No products found.')}
          </p>

          <div aria-busy={status === 'loading'}>
            {status === 'loading' && <LoadingSkeleton count={PAGE_SIZE} />}
            {status === 'error' && <ErrorMessage error={error} onRetry={retry} />}
            {status === 'success' && <ProductList products={products} />}
            {status === 'empty' && (
              <EmptyState query={query} onClearSearch={clearSearch} onReset={page > 1 ? goFirst : undefined} />
            )}
          </div>
        </section>

        <Pagination
          page={page}
          totalPages={totalPages}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={goPrev}
          onNext={goNext}
          disabled={status === 'loading'}
          hidden={status === 'empty' || (status === 'success' && totalPages <= 1)}
        />
      </main>

      <Footer />
    </div>
  );
}
