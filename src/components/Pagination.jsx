// Native <button>s (not links) because paging changes in-app state rather than navigating to a URL.
export default function Pagination({ page, totalPages, hasPrev, hasNext, onPrev, onNext, disabled, hidden }) {
  if (hidden) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn"
        aria-label="Previous page"
        onClick={onPrev}
        disabled={disabled || !hasPrev}
      >
        <span aria-hidden="true">← </span>Previous
      </button>
      <span className="pagination__page">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn--primary"
        aria-label="Next page"
        onClick={onNext}
        disabled={disabled || !hasNext}
      >
        Next<span aria-hidden="true"> →</span>
      </button>
    </nav>
  );
}
