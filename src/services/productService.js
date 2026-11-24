// Service layer: loads the catalog once and maps it to the app's Product model.
import { ApiError, fetchAllProducts, productUrl } from '../api/productsClient';

export function mapProduct(raw) {
  const product = {
    id: raw.id,
    title: raw.title ?? 'Untitled product',
    description: raw.description ?? '',
    brand: raw.brand ?? null,
    category: raw.category ?? 'uncategorized',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    price: Number(raw.price) || 0,
    discountPercentage: Number(raw.discountPercentage) || 0,
    rating: Number(raw.rating) || 0,
    reviewCount: Array.isArray(raw.reviews) ? raw.reviews.length : 0,
    thumbnail: raw.thumbnail ?? null,
    url: productUrl(raw.id),
  };
  // Pre-computed once so each keystroke only does cheap string checks.
  product.searchText = {
    title: product.title.toLowerCase(),
    other: [product.brand, product.category, ...product.tags, product.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
  return product;
}

// Session-level memo: the catalog is fetched at most once per page load, and
// concurrent callers (e.g. React StrictMode double effects) share one request.
let catalogPromise = null;

export function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetchAllProducts()
      .then((json) => {
        if (!json || !Array.isArray(json.products)) {
          throw new ApiError('parse', 'The server sent an unexpected response.');
        }
        return json.products.map(mapProduct);
      })
      .catch((err) => {
        catalogPromise = null; // allow "Try again" to refetch after a failure
        throw err;
      });
  }
  return catalogPromise;
}
