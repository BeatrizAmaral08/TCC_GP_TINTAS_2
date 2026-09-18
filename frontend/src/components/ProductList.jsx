import ProductCard from "./ProductCard";

export default function ProductList({
  products,
  onSelectProduct,
}) {
  return (
    <div className="row g-4">
      {products.map((product) => {
        return (
          <div
            className="col-md-6 col-lg-4"
            key={product.id}
          >
            <ProductCard
              product={product}
              onSelectProduct={onSelectProduct}
            />
          </div>
        );
      })}
    </div>
  );
}
