import {
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  getVolumetrias,
} from "../services/volumetriaService";
import { getApiError } from "../services/api";

function formatMoney(value) {
  return Number(
    value || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

export default function ProdutoDetalhes({
  products,
  user,
  onAddToCart,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [volumetrias, setVolumetrias] = useState([]);
  const [selectedVolumetria, setSelectedVolumetria] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const product = products.find(
    (item) => String(item.idProduto) === String(id)
  );

  useEffect(() => {
    async function loadVolumetrias() {
      setLoading(true);
      setError("");

      try {
        const data = await getVolumetrias(id);

        setVolumetrias(data);

        if (data.length > 0) {
          setSelectedVolumetria(data[0]);
        }
      } catch (requestError) {
        setError(
          getApiError(
            requestError,
            "Não foi possível carregar as volumetrias."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadVolumetrias();
  }, [id]);

  async function handleAdd() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedVolumetria) {
      setError("Selecione uma volumetria.");
      return;
    }

    setMessage("");
    setError("");

    const result = await onAddToCart(
      selectedVolumetria.id,
      quantidade
    );

    if (result.success) {
      setMessage(
        "Produto adicionado ao carrinho com sucesso."
      );
    } else {
      setError(result.message);
    }
  }

  if (!product) {
    return (
      <section className="container page-section">
        <div className="empty-state">
          Produto não encontrado.
        </div>

        <Link
          to="/"
          className="btn btn-primary-gp"
        >
          Voltar para produtos
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-section">
      <button
        type="button"
        className="btn btn-link px-0 mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="product-image-wrapper rounded overflow-hidden">
            <img
              src={product.imagem}
              alt={product.nome}
              className="product-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <span className="product-category">
            {product.categoria || "Tintas"}
          </span>

          <h1 className="mt-2">
            {product.nome}
          </h1>

          <p className="text-muted">
            {product.descricao ||
              "Conheça os detalhes deste produto GPTintas."}
          </p>

          <hr />

          <h5>
            Escolha a volumetria
          </h5>

          {loading ? (
            <p>Carregando volumetrias...</p>
          ) : volumetrias.length === 0 ? (
            <div className="alert alert-warning">
              Este produto ainda não possui volumetrias disponíveis.
            </div>
          ) : (
            <div className="row g-2">
              {volumetrias.map((item) => {
                const selected =
                  selectedVolumetria?.id === item.id;

                return (
                  <div
                    className="col-sm-6"
                    key={item.id}
                  >
                    <button
                      type="button"
                      className={`btn w-100 text-start ${selected ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => {
                        setSelectedVolumetria(item);
                        setQuantidade(1);
                      }}
                    >
                      <strong>
                        {item.volume} {item.unidade}
                      </strong>
                      <br />
                      {formatMoney(item.preco)}
                      <br />
                      <small>
                        Estoque: {item.estoque}
                      </small>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedVolumetria && (
            <div className="mt-4">
              <label
                className="form-label"
                htmlFor="quantity"
              >
                Quantidade
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                max={selectedVolumetria.estoque}
                className="form-control"
                value={quantidade}
                onChange={(event) => {
                  setQuantidade(
                    Math.max(
                      1,
                      Number(event.target.value) || 1
                    )
                  );
                }}
              />
            </div>
          )}

          {message && (
            <div className="alert alert-success mt-3">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary-gp mt-3"
            disabled={
              loading ||
              !selectedVolumetria ||
              Number(selectedVolumetria.estoque) <= 0
            }
            onClick={handleAdd}
          >
            <ShoppingCart size={18} />
            {user ? "Adicionar ao carrinho" : "Entrar para comprar"}
          </button>
        </div>
      </div>
    </section>
  );
}
