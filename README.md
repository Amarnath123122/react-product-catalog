# Data Explorer: React Product Catalog

A small, responsive and accessible React application that retrieves data from a public API and presents it as cards. It includes pagination, debounced search and sorting, and clear loading, empty and error states.

**Repository:** https://github.com/Amarnath123122/react-product-catalog

---

## Table of contents

1. [Getting started](#getting-started)
2. [How each requirement is met](#how-each-requirement-is-met)
3. [Architecture](#architecture)
4. [Key engineering decisions](#key-engineering-decisions)
5. [Accessibility (WCAG 2.2 AA)](#accessibility-wcag-22-aa)
6. [Responsive design](#responsive-design)
7. [Project structure](#project-structure)
8. [Use of AI assistance](#use-of-ai-assistance)

---

## Getting started

**Requirements:** Node.js 18 or later, npm 9 or later

```bash
git clone https://github.com/Amarnath123122/react-product-catalog.git
cd react-product-catalog
npm install
npm run dev        # http://localhost:5173
```

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

**Tech stack:** React 18 and Vite 5, written in plain JavaScript with plain CSS (custom properties). There are no runtime dependencies besides React.

---

## How each requirement is met

### 1. Fetch and display data

| Requirement | Implementation |
|---|---|
| Retrieve data from the API | `fetchAllProducts()` in `src/api/productsClient.js` |
| Show a fixed number of items per page | 10 per page (`PAGE_SIZE` in `src/hooks/useProducts.js`). Set it to `12` to match the brief exactly. |
| Title | `<h3>` in each card |
| Content / description, when available | Shown only if present, limited to 3 lines |
| Author | Shown as the brand (DummyJSON's equivalent of an author) |
| Number of comments | Shown as the review count (DummyJSON's equivalent of comments), next to the rating |
| Selecting an item opens it in a new tab | The whole card is clickable: one `<a target="_blank" rel="noopener noreferrer">` is stretched over the card |

### 2. Page layout

```
<a class="skip-link">          Skip to products
<header>                       <h1> Product Explorer
<main>
  toolbar                      search (role="search") + sort <select>
  <section aria-labelledby>    <h2> Products / Search results
    <ul> <li><article>         <h3> one card per item
  <nav aria-label="Pagination">
<footer>                       logo, copyright, <nav aria-label="Social media">
```

- **Heading structure:** a single `h1`, then `h2` for the section and `h3` for each card, with no levels skipped.
- **Page title:** "Product Catalog | Product Explorer". It updates dynamically, for example *"phone" – Page 2 – Product Catalog | Product Explorer*.

### 3. Pagination

- **Previous / Next** buttons, with a "Page X of Y" indicator.
- Previous is **disabled** on page 1 and Next is **disabled** on the last page. Both are disabled while data is loading.
- Pagination is **hidden** when there is only one page or no results.
- After a page change, the view scrolls to the top and focus moves to the list heading, so keyboard and screen-reader users start at the new content.
- Changing the search or the sort resets to page 1 in the same render, so an out-of-range page never shows.

### 4. Loading, empty and error states

| State | What the user sees |
|---|---|
| **Loading** | Skeleton cards that match the real layout. `role="status"` with the text "Loading products…". The list is marked `aria-busy`. |
| **Success** | The card grid and a "1–10 of 194" counter. A screen-reader live region announces the result. |
| **Empty** | A friendly panel. For a search with no matches: *No results for "xyz"* with a **Clear search** button. |
| **Error** | A typed message for each failure (offline, timeout, server error, invalid data), a technical detail line, and a **Try again** button. Uses `role="alert"`. |

Errors are classified in the API layer as an `ApiError` with a `kind` of `network`, `timeout`, `http` or `parse`. The UI picks a message based on the kind and never parses error strings. Requests time out after 15 seconds instead of hanging.

### 5. Responsive design

The CSS is mobile-first, with breakpoints at **600 px** (tablet), **960 px** (desktop) and **1280 px** (wide). Details are in [Responsive design](#responsive-design).

### 6. Accessibility

Details are in [Accessibility (WCAG 2.2 AA)](#accessibility-wcag-22-aa).

### 7. Footer

| Requirement | Implementation |
|---|---|
| Protegrity logo | `<img src="/protegrity-logo.svg" alt="Protegrity logo">`. Falls back to a text wordmark if the file is missing (see the note below). |
| X icon linking to the company account | `https://x.com/protegrity` |
| LinkedIn icon linking to the company account | `https://www.linkedin.com/company/protegrity` |
| Opens in a new tab | `target="_blank" rel="noopener noreferrer"`. The accessible name includes "(opens in a new tab)". |

The links live in `src/config/site.js` and the icons in `src/components/icons.jsx`.

> **Logo asset:** the official logo is not committed, to avoid redistributing brand assets.
> Add it as `public/protegrity-logo.svg`; it is picked up automatically.

---

## Architecture

The code follows a strict separation of concerns. Each layer depends only on the layer below it.

```
┌──────────────────────────────────────────────────────────────┐
│ UI components (src/components)                               │
│   Presentational only: props in, markup out. No fetching.    │
├──────────────────────────────────────────────────────────────┤
│ Composition root (src/App.jsx)                               │
│   Page layout; connects hooks to components.                 │
├──────────────────────────────────────────────────────────────┤
│ Hooks (src/hooks)                                            │
│   useProducts: load state, memoised search/sort/paginate     │
│   useDebouncedValue: generic debounce                        │
├──────────────────────────────────────────────────────────────┤
│ Services (src/services)                                      │
│   productService: fetch once, map raw JSON to Product model  │
│   productQuery: PURE search / sort / paginate functions      │
├──────────────────────────────────────────────────────────────┤
│ API client (src/api)                                         │
│   HTTP only: URL, timeout, abort, typed ApiError             │
└──────────────────────────────────────────────────────────────┘
```

**Why this split matters**

- **Changing the API is local.** Components only ever see the app's own `Product` model, never raw API JSON.
- **The logic is testable.** `productQuery.js` has no React and no I/O. It is plain functions with data in and data out.
- **Components stay simple.** None of them knows where the data comes from.

---

## Key engineering decisions

### 1. Fetch once, then search, sort and paginate in the browser
The full catalog (194 items) is requested **once** with `?limit=0&select=…`, which returns only the fields the UI uses. That cut the payload from about 306 KB to about 178 KB before compression.
After that first request, search, sort and page changes cause **no further API calls** and respond instantly.

- The request is memoised as a shared promise. Concurrent callers, such as React StrictMode running effects twice, share a single request.
- After a failure the memo is cleared, so **Try again** really refetches.
- **Trade-off:** this suits a small catalog. With thousands of items, server-side querying and paging would be the right choice.

### 2. Debounced search
- The input updates on every keystroke, but filtering only runs after **250 ms** without typing (`useDebouncedValue`).
- Queries are normalised (trimmed, whitespace collapsed, lower-cased), so `"Phone "` and `"phone"` count as the same query and don't trigger extra work.
- Each product's search text is lower-cased once when it is mapped, so each search pass only does simple substring checks.
- A small spinner shows while the debounce is pending. Escape clears the search.

### 3. Search ranking ("Best match")
- Every search word must match at least one field (AND semantics).
- Scoring: a word at the start of a title word scores 3, anywhere in the title scores 2, and in the brand, category, tags or description scores 1.
- Sorting is stable, so ties keep the API's original order.

### 4. Sorting
Available sorts: best match, price low to high, price high to low, rating highest first, and name A–Z.
- Price sorting uses the **discounted price the user sees**, not the list price.
- Name sorting uses `Intl.Collator` for locale-aware, case-insensitive ordering.

### 5. Derived state instead of synchronising effects
- Search results, sorted lists and the current page are computed with `useMemo`; they are not copied into state.
- The page number is stored together with the query and sort it belongs to. A changed query or sort therefore resets the page to 1 in the same render, with no extra effect and no flicker.

### 6. Robust networking
- A 15-second timeout is combined with the caller's `AbortSignal`.
- Failures are typed (`network`, `timeout`, `http`, `parse`), and the response shape is validated before it is used.
- The mapper falls back to safe defaults for missing fields, so one bad record cannot crash the grid.

---

## Accessibility (WCAG 2.2 AA)

| Area | What was done | Criteria |
|---|---|---|
| **Semantic HTML** | `header`, `main`, labelled `section` and `nav` landmarks, `footer`, `ul`/`li` with `article`, `time`, ordered headings, `lang="en"` | 1.3.1, 2.4.6 |
| **Keyboard** | Everything is reachable by Tab in a logical order. There is a skip link. Focus moves to the results heading after a page change. Escape clears the search. | 2.1.1, 2.4.1, 2.4.3 |
| **Visible focus** | 3 px focus ring (≥ 3:1 contrast) on every control. Cards show a ring only for keyboard focus, not after a mouse click. | 2.4.7 |
| **Focus not obscured** | `scroll-padding-top` keeps focused items clear of the sticky header. | **2.4.11** (new in 2.2) |
| **Link vs button semantics** | Navigation to an item is a link (`<a>`). Pagination, Retry and Clear are `<button>`s because they change in-app state. | 4.1.2 |
| **Contrast** | All text was checked with a contrast script: the lowest is **5.18:1** (white on the orange button), and normal text is about 6–17:1, in both light and dark themes. Focus rings (≥ 4.8:1) and control borders are ≥ 3:1. | 1.4.3, 1.4.11 |
| **Accessible names** | The search has a `<label>`. The sort is a labelled native `<select>`. Icon-only links have `aria-label`s that include "(opens in a new tab)". Decorative icons and images are `aria-hidden` or have `alt=""`. | 1.1.1, 2.4.4, 2.5.3, 4.1.2 |
| **Status messages** | A polite live region announces results, e.g. "Showing products 1 to 10 of 194, page 1 of 20". Errors use `role="alert"`. | **4.1.3** |
| **Target size** | Buttons and social icons are at least 44 × 44 px. | **2.5.8** |
| **Reflow** | Works at a 320 px width without horizontal scrolling. | 1.4.10 |
| **Motion and themes** | Respects `prefers-reduced-motion`, `prefers-color-scheme` (dark mode) and `forced-colors` (Windows High Contrast). | 2.3.3 (AAA, bonus) |

Screen-reader text is used where visuals alone would be ambiguous, e.g. "Price: $8.94 was $9.99" and "Rated 4.5 out of 5".

---

## Responsive design

| Viewport | Layout |
|---|---|
| **Mobile** (< 600 px) | One column of compact horizontal cards (thumbnail left, details right). The header, toolbar and footer stack. Pagination buttons are full width. |
| **Tablet** (600–959 px) | 2-column card grid. Search and sort sit on one row. |
| **Desktop** (960–1279 px) | 3-column card grid |
| **Wide** (≥ 1280 px) | 4-column card grid, max width 1240 px |

- **Card alignment:** titles reserve 2 lines and descriptions 3 lines, and the price row is pinned to the bottom. Every card in a row lines up regardless of content length.
- **No horizontal overflow:** grid tracks use `minmax(0, 1fr)`, and long words wrap.
- **No layout shift:** images use a fixed `aspect-ratio`, and the loading skeletons match the real layout at every breakpoint.
- **Touch devices:** hover effects only apply on devices with a real hover (`@media (hover: hover)`), so taps don't leave cards stuck "lifted".

---

## Project structure

```
├── index.html                    # Page title, meta description, <noscript>
├── public/                       # Static assets (add protegrity-logo.svg here)
├── src/
│   ├── main.jsx                  # React root
│   ├── App.jsx                   # Layout + wiring (composition root)
│   ├── index.css                 # Mobile-first styles, design tokens, dark mode
│   ├── api/
│   │   └── productsClient.js     # HTTP, timeout, ApiError
│   ├── services/
│   │   ├── productService.js     # Fetch once, map to Product model
│   │   └── productQuery.js       # Pure search / sort / paginate
│   ├── hooks/
│   │   ├── useProducts.js        # Data + derived state
│   │   └── useDebouncedValue.js  # Generic debounce
│   ├── config/
│   │   └── site.js               # Company name, logo path, social URLs
│   ├── utils/
│   │   └── format.js             # Currency formatting
│   └── components/
│       ├── Header.jsx
│       ├── SearchBar.jsx
│       ├── SortSelect.jsx
│       ├── ProductList.jsx
│       ├── ProductCard.jsx
│       ├── Pagination.jsx
│       ├── StatusViews.jsx       # LoadingSkeleton, ErrorMessage, EmptyState
│       ├── Footer.jsx
│       └── icons.jsx             # X and LinkedIn SVG icons
└── vite.config.js
```

---

## Use of AI assistance

As permitted by the brief, an AI coding assistant (Claude) was used to scaffold and iterate on the code.
All generated code was reviewed and directed through explicit decisions: architecture boundaries, the data-fetching strategy, accessibility requirements, and the trade-offs documented above.
The layout was verified with real browser screenshots at desktop and mobile widths, and colour contrast was verified with a WCAG contrast-ratio script.
