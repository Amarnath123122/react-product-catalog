// API layer: knows how to talk to the DummyJSON products endpoint over HTTP, nothing else.
const BASE_URL = 'https://dummyjson.com';
const TIMEOUT_MS = 15000;

// Only request the fields the UI uses (~40% smaller payload).
const FIELDS = [
  'title', 'description', 'brand', 'category', 'price',
  'discountPercentage', 'rating', 'thumbnail', 'tags', 'reviews',
].join(',');

// Typed error so the UI can show a helpful message without parsing strings.
export class ApiError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // 'network' | 'timeout' | 'http' | 'parse'
    this.status = status;
  }
}

async function getJson(url, { signal } = {}) {
  // Combine the caller's abort signal with a timeout so requests never hang forever.
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS);
  const onAbort = () => timeout.abort();
  signal?.addEventListener('abort', onAbort);

  let response;
  try {
    response = await fetch(url, { signal: timeout.signal });
  } catch (err) {
    if (signal?.aborted) throw err; // cancelled by caller: not a user-facing error
    if (err.name === 'AbortError') {
      throw new ApiError('timeout', 'The server took too long to respond.');
    }
    throw new ApiError('network', 'Unable to reach the server.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }

  if (!response.ok) {
    throw new ApiError('http', `The server returned an error (${response.status}).`, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('parse', 'The server sent an unexpected response.');
  }
}

/** Fetches the entire catalog in one request (`limit=0` = no limit). */
export function fetchAllProducts({ signal } = {}) {
  return getJson(`${BASE_URL}/products?limit=0&select=${FIELDS}`, { signal });
}

export const productUrl = (id) => `${BASE_URL}/products/${id}`;
