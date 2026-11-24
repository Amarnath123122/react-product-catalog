import ProductCard from './ProductCard';

// Pure list renderer; the empty state is decided by the parent.
export default function ProductList({ products }) {
  return (
    <ul className="list">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
