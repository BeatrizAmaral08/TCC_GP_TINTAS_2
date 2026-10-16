import {
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import ProductList from "../components/ProductList";
import ProductModal from "../components/ProductModal";
import SkeletonLoading from "../components/SkeletonLoading";

export default function Home({
  products,
  categories,
  loading,
  error,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const banners = [
    { title: "Sua próxima ideia começa com uma cor", text: "Explore nosso catálogo e encontre a tinta para transformar seu ambiente." },
    { title: "Encontre a cor do seu projeto", text: "Compare opções, confira os produtos e escolha com mais facilidade." },
    { title: "Renove seus espaços com GP Tintas", text: "Veja nossa seleção de produtos e encontre sua próxima cor favorita." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((current) => (current + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = String(
        product.nome || ""
      ).toLowerCase();

      const productCategory = String(
        product.categoria || ""
      );

      const searchMatches = productName.includes(
        search.toLowerCase()
      );

      const categoryMatches =
        category === "Todas" ||
        productCategory === category;

      return (
        searchMatches &&
        categoryMatches
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <span className="hero-tag">GPTintas</span>
          <h1>{banners[bannerIndex].title}</h1>
          <p>{banners[bannerIndex].text}</p>
          <div className="product-banner-controls" aria-label="Destaques do catálogo">
            {banners.map((banner, index) => (
              <button key={banner.title} type="button" className={bannerIndex === index ? "active" : ""} onClick={() => setBannerIndex(index)} aria-label={`Mostrar destaque ${index + 1}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="container page-section">
        <div className="section-heading">
          <div>
            <span className="section-label">
              Produtos
            </span>

            <h2>
              Catálogo GPTintas
            </h2>
          </div>
        </div>

        <div className="filter-card">
          <div className="row g-3">
            <div className="col-lg-8">
              <label
                className="form-label"
                htmlFor="productSearch"
              >
                Buscar produto
              </label>

              <div className="input-with-icon">
                <Search size={18} />

                <input
                  id="productSearch"
                  className="form-control"
                  placeholder="Digite o nome da tinta"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                  }}
                />
              </div>
            </div>

            <div className="col-lg-4">
              <label
                className="form-label"
                htmlFor="categoryFilter"
              >
                Categoria
              </label>

              <select
                id="categoryFilter"
                className="form-select"
                value={category}
                onChange={(event) => {
                  setCategory(
                    event.target.value
                  );
                }}
              >
                <option value="Todas">
                  Todas
                </option>

                {categories.map((item) => {
                  return (
                    <option
                      key={item.id}
                      value={item.nome}
                    >
                      {item.nome}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonLoading />
        ) : (
          <>
            <p className="result-count">
              {filteredProducts.length} produto(s) disponível(is)
            </p>

            <ProductList
              products={filteredProducts}
              onSelectProduct={setSelectedProduct}
            />

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                Nenhum produto encontrado.
              </div>
            )}
          </>
        )}
      </section>

      <ProductModal
        product={selectedProduct}
        onClose={() => {
          setSelectedProduct(
            null
          );
        }}
      />
    </>
  );
}
