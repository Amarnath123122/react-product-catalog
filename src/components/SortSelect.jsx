// Native <select> for built-in keyboard and screen-reader support.
export default function SortSelect({ value, options, onChange }) {
  return (
    <div className="sort">
      <label htmlFor="product-sort" className="field__label">
        Sort by
      </label>
      <select
        id="product-sort"
        className="sort__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
