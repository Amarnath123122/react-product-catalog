import { useRef } from 'react';

// Controlled search input. Debouncing is the parent's concern; this only reports keystrokes.
export default function SearchBar({ value, onChange, isPending }) {
  const inputRef = useRef(null);

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="product-search" className="field__label">
        Search products
      </label>
      <div className="search__box">
        <svg className="search__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M10 2a8 8 0 0 1 6.32 12.9l5.39 5.39-1.42 1.42-5.39-5.39A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
        </svg>
        <input
          ref={inputRef}
          id="product-search"
          className="search__input"
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck="false"
          placeholder="e.g. phone, laptop, perfume"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && value && (e.preventDefault(), clear())}
          aria-describedby="search-hint"
        />
        {isPending && <span className="search__spinner" aria-hidden="true" />}
        {value && (
          <button type="button" className="search__clear" onClick={clear} aria-label="Clear search">
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <span id="search-hint" className="sr-only">
        Results update as you type. Press Escape to clear.
      </span>
    </form>
  );
}
