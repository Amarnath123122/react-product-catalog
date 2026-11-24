// Presentational views for the non-success states of the product list.

export function LoadingSkeleton({ count = 6 }) {
  return (
    <div role="status" className="skeleton-grid">
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton" aria-hidden="true">
          <div className="skeleton__block" />
          <div className="skeleton__line short" />
          <div className="skeleton__line" />
          <div className="skeleton__line medium" />
        </div>
      ))}
    </div>
  );
}

const ERROR_COPY = {
  network: {
    title: 'You appear to be offline',
    hint: 'Check your internet connection, then try again.',
  },
  timeout: {
    title: 'This is taking longer than expected',
    hint: 'The server is slow to respond. Please try again in a moment.',
  },
  http: {
    title: 'Something went wrong on our end',
    hint: 'The product service is having trouble. Please try again shortly.',
  },
  parse: {
    title: 'We received unexpected data',
    hint: 'Please try again. If this keeps happening, the service may have changed.',
  },
};

export function ErrorMessage({ error, onRetry }) {
  const copy = ERROR_COPY[error?.kind] ?? {
    title: 'Could not load products',
    hint: 'An unexpected error occurred. Please try again.',
  };
  return (
    <div role="alert" className="panel panel--error">
      <span className="panel__icon" aria-hidden="true">⚠️</span>
      <h3 className="panel__title">{copy.title}</h3>
      <p className="panel__text">{copy.hint}</p>
      {error?.message && <p className="panel__detail">Details: {error.message}</p>}
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function EmptyState({ query, onClearSearch, onReset }) {
  return (
    <div className="panel">
      <span className="panel__icon" aria-hidden="true">{query ? '🔍' : '📦'}</span>
      <h3 className="panel__title">
        {query ? <>No results for “{query}”</> : 'No products to show'}
      </h3>
      <p className="panel__text">
        {query ? 'Check the spelling or try a more general term.' : 'There are no products on this page.'}
      </p>
      {query && onClearSearch && (
        <button type="button" className="btn btn--primary" onClick={onClearSearch}>
          Clear search
        </button>
      )}
      {!query && onReset && (
        <button type="button" className="btn" onClick={onReset}>
          Go to first page
        </button>
      )}
    </div>
  );
}
