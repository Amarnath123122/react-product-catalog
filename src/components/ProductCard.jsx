import { discountedPrice, formatPrice } from '../utils/format';

// The title link is stretched over the whole card (see .card__link::after in CSS),
// so the entire card is clickable while remaining a single, semantic link.
export default function ProductCard({ product }) {
  const titleId = `product-${product.id}-title`;
  const hasDiscount = product.discountPercentage >= 1;
  const finalPrice = hasDiscount
    ? discountedPrice(product.price, product.discountPercentage)
    : product.price;

  return (
    <article className="card" aria-labelledby={titleId}>
      {product.thumbnail && (
        <img className="card__thumb" src={product.thumbnail} alt="" loading="lazy" width="300" height="300" />
      )}

      <div className="card__meta">
        <span className="tag">{product.category}</span>
        {product.brand && <span className="card__author">{product.brand}</span>}
      </div>

      <h3 id={titleId} className="card__title">
        <a className="card__link" href={product.url} target="_blank" rel="noopener noreferrer">
          <span className="card__title-text">{product.title}</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </h3>

      {product.description && <p className="card__description">{product.description}</p>}

      <div className="card__footer">
        <p className="card__price">
          <span className="sr-only">Price: </span>
          {formatPrice(finalPrice)}
          {hasDiscount && (
            <>
              {' '}
              <s className="card__price-old">
                <span className="sr-only">was </span>
                {formatPrice(product.price)}
              </s>
            </>
          )}
        </p>
        <p className="card__stats">
          <span aria-hidden="true">★ </span>
          <span className="sr-only">Rated </span>
          {product.rating.toFixed(1)}
          <span className="sr-only"> out of 5</span> · {product.reviewCount}{' '}
          {product.reviewCount === 1 ? 'review' : 'reviews'}
        </p>
      </div>
    </article>
  );
}
