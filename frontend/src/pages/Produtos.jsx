import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductList from "../components/ProductList";
import ProductModal from "../components/ProductModal";
import SkeletonLoading from "../components/SkeletonLoading";

export default function Home({
  products = [],
  categories = [],
  loading,
  error,
  user,
}) {
  const navigate = useNavigate();

  // Estados da página
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [brand, setBrand] = useState("Todas");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  //controle de acesso aos produtos

  function handleSelectProduct(product) {
    const productId = product.id ?? product.idProduto;

    if (productId == null) {
      return;
    }

    // Visitante sem login
    if (!user) {
      navigate("/login", {
        state: {
          from: `/produto/${productId}`,
        },
      });

      return;
    }

    // Cliente autenticado
    setSelectedProduct(product);
  }

  //banners do catalogo
  const banners = [
    {
      title: "Sua próxima ideia começa com uma cor",
      text: "Explore nosso catálogo e encontre a tinta para transformar seu ambiente.",
    },
    {
      title: "Encontre a cor do seu projeto",
      text: "Compare opções, confira os produtos e escolha com mais facilidade.",
    },
    {
      title: "Renove seus espaços com GP Tintas",
      text: "Veja nossa seleção de produtos e encontre sua próxima cor favorita.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(
        (current) => (current + 1) % banners.length
      );
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  //lista das marcas disponiveis

  // Monta as opções de marcas com base nos produtos
  const brands = useMemo(() => {
    const uniqueBrands = new Map();

    products.forEach((product) => {
      const productBrand = String(
        product.marca || ""
      ).trim();

      if (productBrand) {
        const key = productBrand.toLocaleLowerCase("pt-BR");

        if (!uniqueBrands.has(key)) {
          uniqueBrands.set(key, productBrand);
        }
      }
    });

    return [...uniqueBrands.entries()]
      .sort((a, b) =>
        a[1].localeCompare(b[1], "pt-BR")
      )
      .map(([key, name]) => ({
        key,
        name,
      }));
  }, [products]);

  //pesquisa e filtro de produtos

  const filteredProducts = useMemo(() => {
    const searchTerm = search
      .trim()
      .toLocaleLowerCase("pt-BR");

    return products.filter((product) => {
      const productName = String(
        product.nome || ""
      ).toLocaleLowerCase("pt-BR");

      const productBrand = String(
        product.marca || ""
      ).trim().toLocaleLowerCase("pt-BR");

      const productCategory = String(
        product.categoria || ""
      );

      // Pesquisa pelo nome ou pela marca
      const searchMatches =
        productName.includes(searchTerm) ||
        productBrand.includes(searchTerm);

      // Filtra pela categoria selecionada
      const categoryMatches =
        category === "Todas" ||
        productCategory === category;

      // Filtra pela marca selecionada
      const brandMatches =
        brand === "Todas" ||
        productBrand === brand;

      return (
        searchMatches &&
        categoryMatches &&
        brandMatches
      );
    });
  }, [products, search, category, brand]);

  //inter
  return (
    <>
      {/* Banners */}
      <section className="hero-section">
        <div className="container hero-content">
          <span className="hero-tag">
            GPTintas
          </span>

          <h1>
            {banners[bannerIndex].title}
          </h1>

          <p>
            {banners[bannerIndex].text}
          </p>

          <div
            className="product-banner-controls"
            aria-label="Destaques do catálogo"
          >
            {banners.map((banner, index) => (
              <button
                key={banner.title}
                type="button"
                className={
                  bannerIndex === index
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setBannerIndex(index);
                }}
                aria-label={
                  `Mostrar destaque ${index + 1}`
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo de produtos */}
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

        {/* Pesquisa, categoria e marca */}
        <div className="filter-card">
          <div className="row g-3">

            {/* Pesquisa pelo nome ou marca */}
            <div className="col-lg-6">
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
                  type="search"
                  placeholder="Digite o nome ou a marca"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                />
              </div>
            </div>

            {/* Filtro de categorias */}
            <div className="col-lg-3">
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
                  setCategory(event.target.value);
                }}
              >
                <option value="Todas">
                  Todas
                </option>

                {categories.map((item) => (
                  <option
                    key={item.id}
                    value={item.nome}
                  >
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de marcas */}
            <div className="col-lg-3">
              <label
                className="form-label"
                htmlFor="brandFilter"
              >
                Marca
              </label>

              <select
                id="brandFilter"
                className="form-select"
                value={brand}
                onChange={(event) => {
                  setBrand(event.target.value);
                }}
              >
                <option value="Todas">
                  Todas as marcas
                </option>

                {brands.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        {/* Lista de produtos */}
        {loading ? (
          <SkeletonLoading />
        ) : (
          <>
            <p className="result-count">
              {filteredProducts.length} produto(s) disponível(is)
            </p>

            <ProductList
              products={filteredProducts}
              onSelectProduct={handleSelectProduct}
            />

            {filteredProducts.length === 0 && (
              <div className="empty-state">
                Nenhum produto encontrado.
              </div>
            )}
          </>
        )}
      </section>

      {/* Detalhes para usuários logados */}
      <ProductModal
        product={selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
        }}
      />
    </>
  );
}
