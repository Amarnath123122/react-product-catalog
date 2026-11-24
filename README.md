# React Product Catalog

A small, responsive, accessible React + Vite app that lists products from
[DummyJSON](https://dummyjson.com/products), with client-side search, sorting and pagination.

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
```

## Features

- 10 products per page with Previous / Next pagination
- Debounced search (250 ms) across title, brand, category, tags and description
- Sorting: best match, price, rating, name
- Loading skeletons, empty state and typed error states with retry
- Responsive: 1 → 2 → 3 → 4 column grid (mobile, tablet, desktop, wide)
- WCAG 2.2 AA considerations: semantic landmarks, keyboard support, visible focus,
  live-region announcements, sufficient contrast, reduced-motion support

## Data strategy

The full catalog (194 items) is fetched **once** with `?limit=0&select=…` (only needed fields).
Search, sort and pagination then run in memory, so no further API calls are made.
This suits a small catalog; for large datasets server-side querying would be preferable.

## Architecture (separation of concerns)

| Layer | File | Responsibility |
|---|---|---|
| API | `src/api/productsClient.js` | Single HTTP call, timeout, typed `ApiError` |
| Service | `src/services/productService.js` | Fetch catalog once, map to `Product` model |
| Query logic | `src/services/productQuery.js` | Pure search / sort / paginate functions |
| Hooks | `src/hooks/useProducts.js`, `useDebouncedValue.js` | State, memoised derivations, debouncing |
| Config | `src/config/site.js` | Brand and social links |
| UI | `src/components/*` | Presentational components only |
| Composition | `src/App.jsx` | Page layout; wires hooks to components |

## Logo

Place the official logo at `public/protegrity-logo.svg`. Until then a text wordmark is shown.
