// Pure formatting helpers (no React, no I/O).
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = (n) => currency.format(n);

export const discountedPrice = (price, pct) => price * (1 - pct / 100);
