// Hook layer: loads the catalog once, then derives search / sort / page results in memory.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCatalog } from '../services/productService';
import { DEFAULT_SORT, paginate, searchProducts, sortResults } from '../services/productQuery';

export const PAGE_SIZE = 10;

export function useProducts({ query = '', sort = DEFAULT_SORT, pageSize = PAGE_SIZE } = {}) {
  // ---- Remote data: exactly one request per page load ----
  const [catalog, setCatalog] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    setError(null);
    try {
      setCatalog(await getCatalog());
      setLoadState('ready');
    } catch (err) {
      setError(err);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    let active = true;
    getCatalog()
      .then((items) => {
        if (!active) return;
        setCatalog(items);
        setLoadState('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
        setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, []);

  // ---- Client-side derivations (memoised: recomputed only when inputs change) ----
  const matches = useMemo(() => searchProducts(catalog, query), [catalog, query]);
  const sorted = useMemo(() => sortResults(matches, sort), [matches, sort]);

  // Page is tied to the query+sort it belongs to, so changing either resets to page 1
  // in the same render (no flash of an out-of-range page).
  const filterKey = `${query}\u0000${sort}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const requestedPage = pageState.key === filterKey ? pageState.page : 1;
  const { items, page, totalPages } = useMemo(
    () => paginate(sorted, requestedPage, pageSize),
    [sorted, requestedPage, pageSize]
  );

  const setPage = (next) => setPageState({ key: filterKey, page: next });

  let status = loadState;
  if (loadState === 'ready') status = items.length > 0 ? 'success' : 'empty';

  return {
    products: items,
    status, // loading | success | empty | error
    error,
    page,
    totalPages,
    total: sorted.length,
    catalogSize: catalog.length,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goPrev: () => setPage(Math.max(1, page - 1)),
    goNext: () => setPage(Math.min(totalPages, page + 1)),
    goFirst: () => setPage(1),
    retry: load,
  };
}
