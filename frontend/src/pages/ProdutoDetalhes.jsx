import { ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getVolumetrias } from "../services/volumetriaService";
import { getApiError } from "../services/api";

// Formata valores monetários em reais
function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Retorna o desconto válido da volumetria
function getDesconto(volume) {
  const desconto = Number(volume?.desconto ?? 0);

  if (
    !Number.isFinite(desconto) ||
    desconto <= 0 ||
    desconto > 100
  ) {
    return 0;
  }

  return desconto;
}

// Calcula o preço promocional
function getPrecoFinal(volume) {
  if (!volume) return 0;

  const preco = Number(volume.preco || 0);
  const desconto = getDesconto(volume);

  // Utiliza o preço calculado pelo backend, quando disponível
  if (
    volume.precoFinal != null &&
    Number.isFinite(Number(volume.precoFinal))
  ) {
    return Number(volume.precoFinal);
  }

  // Cálculo utilizado somente para exibição
  return Math.round(
    preco * (1 - desconto / 100) * 100
  ) / 100;
}

export default function ProdutoDetalhes({
  products = [],
  user,
  onAddToCart,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados das volumetrias e quantidade
  const [volumetrias, setVolumetrias] = useState([]);
  const [selectedVolumetria, setSelectedVolumetria] =
    useState(null);

  const [quantidade, setQuantidade] = useState(1);

  // Estados de carregamento e mensagens
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Controla a imagem exibida na galeria
  const [fotoAtual, setFotoAtual] = useState(0);

  //identificar produto selecionado

  const product = products.find(
    (item) =>
      String(item.id ?? item.idProduto) === String(id)
  );

 //galeria de imagens

  const imagensExtras = Array.isArray(product?.imagens)
    ? product.imagens
    : [];

  const fotos = [
    product?.imagem,
    ...imagensExtras,
  ].filter(Boolean);

  const fotosUnicas = [...new Set(fotos)];

  // Reinicia as informações ao trocar de produto
  useEffect(() => {
    setFotoAtual(0);
    setQuantidade(1);
    setMessage("");
    setError("");
  }, [id]);

  // Faz a troca automática das imagens
  useEffect(() => {
    if (fotosUnicas.length <= 1) {
      return;
    }

    const intervalo = setInterval(() => {
      setFotoAtual(
        (atual) => (atual + 1) % fotosUnicas.length
      );
    }, 4000);

    return () => clearInterval(intervalo);
  }, [fotosUnicas.length, id]);

  //carregar volumetrias

  useEffect(() => {
    let ativo = true;

    async function loadVolumetrias() {
      setLoading(true);
      setError("");
      setVolumetrias([]);
      setSelectedVolumetria(null);

      try {
        const data = await getVolumetrias(id);

        if (!ativo) return;

        const lista = Array.isArray(data) ? data : [];

        setVolumetrias(lista);

        // Seleciona o primeiro volume com estoque
        const primeiraDisponivel = lista.find(
          (item) => Number(item.estoque) > 0
        );

        setSelectedVolumetria(
          primeiraDisponivel || lista[0] || null
        );

      } catch (requestError) {
        if (!ativo) return;

        setError(
          getApiError(
            requestError,
            "Não foi possível carregar as volumetrias."
          )
        );

      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadVolumetrias();
    } else {
      setLoading(false);
    }

    return () => {
      ativo = false;
    };
  }, [id]);

  //informações do desconto selecionado
  const descontoSelecionado = getDesconto(
    selectedVolumetria
  );

  const precoOriginal = Number(
    selectedVolumetria?.preco || 0
  );

  const precoFinal = getPrecoFinal(
    selectedVolumetria
  );

  const possuiDesconto = descontoSelecionado > 0;

  //adiciona ao carrinho
  async function handleAdd() {
    // Direciona visitantes para o login
    if (!user) {
      navigate("/login", {
        state: {
          from: `/produto/${id}`,
        },
      });

      return;
    }

    // Exige uma volumetria selecionada
    if (!selectedVolumetria) {
      setError("Selecione uma volumetria.");
      return;
    }

    const estoque = Number(
      selectedVolumetria.estoque
    );

    if (estoque <= 0) {
      setError(
        "Esta volumetria está indisponível."
      );
      return;
    }

    // Valida a quantidade
    if (
      !Number.isInteger(quantidade) ||
      quantidade < 1 ||
      quantidade > estoque
    ) {
      setError(
        "Escolha uma quantidade válida dentro do estoque disponível."
      );
      return;
    }

    setMessage("");
    setError("");
    setAdicionando(true);

    try {
      //envia somente a volumetria e a quantidade.
      // O backend deve calcular o preço com desconto.
      const result = await onAddToCart(
        selectedVolumetria.id ??
        selectedVolumetria.idProdutoVolumetria,
        quantidade
      );

      if (result?.success) {
        setMessage(
          "Produto adicionado ao carrinho com sucesso."
        );
      } else {
        setError(
          result?.message ||
          "Não foi possível adicionar o produto ao carrinho."
        );
      }

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível adicionar o produto ao carrinho."
        )
      );

    } finally {
      setAdicionando(false);
    }
  }

  if (!product) {
    return (
      <section className="container page-section">
        <div className="empty-state">
          Produto não encontrado ou catálogo ainda
          não carregado.
        </div>

        <Link
          to="/produtos"
          className="btn btn-primary-gp mt-3"
        >
          <ArrowLeft size={18} />
          Voltar para produtos
        </Link>
      </section>
    );
  }

  //interface da pagina
  return (
    <section className="container page-section">

      {/* Botão para voltar ao catálogo */}
      <Link
        to="/produtos"
        className="btn btn-link px-0 mb-4"
      >
        <ArrowLeft size={18} />
        Voltar para produtos
      </Link>

      <div className="row g-4">

        {/*galeria de fotos*/}

        <div className="col-lg-6">

          <div className="product-image-wrapper rounded overflow-hidden position-relative">

            {fotosUnicas.length > 0 ? (
              <img
                src={
                  fotosUnicas[fotoAtual] ||
                  fotosUnicas[0]
                }
                alt={`${product.nome} - foto ${fotoAtual + 1}`}
                className="product-image"
                onError={(event) => {
                  event.currentTarget.style.visibility =
                    "hidden";
                }}
              />
            ) : (
              <div className="empty-state">
                Produto sem imagem disponível.
              </div>
            )}

            {/* Botões de navegação da galeria */}
            {fotosUnicas.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
                  aria-label="Foto anterior"
                  onClick={() => {
                    setFotoAtual(
                      (atual) =>
                        (
                          atual - 1 +
                          fotosUnicas.length
                        ) % fotosUnicas.length
                    );
                  }}
                >
                  <ChevronLeft />
                </button>

                <button
                  type="button"
                  className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
                  aria-label="Próxima foto"
                  onClick={() => {
                    setFotoAtual(
                      (atual) =>
                        (atual + 1) %
                        fotosUnicas.length
                    );
                  }}
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas das imagens */}
          {fotosUnicas.length > 1 && (
            <div className="d-flex flex-wrap gap-2 mt-3">

              {fotosUnicas.map((foto, index) => (
                <button
                  type="button"
                  key={`${foto}-${index}`}
                  className={`p-1 rounded ${fotoAtual === index
                      ? "border border-primary border-3"
                      : "border"
                    }`}
                  onClick={() =>
                    setFotoAtual(index)
                  }
                  aria-label={`Mostrar foto ${index + 1}`}
                >
                  <img
                    src={foto}
                    alt={`Miniatura ${index + 1}`}
                    style={{
                      width: "65px",
                      height: "65px",
                      objectFit: "contain",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* informações do produto */}

        <div className="col-lg-6">

          {/* Categoria */}
          <span className="product-category">
            {product.categoria || "Produto"}
          </span>

          {/* Nome */}
          <h1 className="mt-2">
            {product.nome}
          </h1>

          {/* Descrição */}
          <p className="text-muted">
            {product.descricao ||
              "Conheça os detalhes deste produto GP Tintas."}
          </p>

          <hr />

          {/* escolher volumetria */}

          <h5>Escolha a volumetria</h5>

          {loading ? (
            <p>Carregando volumetrias...</p>
          ) : volumetrias.length === 0 ? (
            <div className="alert alert-warning">
              Este produto ainda não possui
              volumetrias disponíveis.
            </div>
          ) : (
            <div className="row g-2">

              {volumetrias.map((item) => {
                const itemId =
                  item.id ??
                  item.idProdutoVolumetria;

                const selectedId =
                  selectedVolumetria?.id ??
                  selectedVolumetria?.idProdutoVolumetria;

                const selected =
                  String(selectedId) === String(itemId);

                const indisponivel =
                  Number(item.estoque) <= 0;

                const desconto = getDesconto(item);
                const precoComDesconto =
                  getPrecoFinal(item);

                return (
                  <div
                    className="col-sm-6"
                    key={itemId}
                  >
                    <button
                      type="button"
                      disabled={indisponivel}
                      className={`btn w-100 text-start ${indisponivel
                          ? "btn-secondary"
                          : selected
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                      onClick={() => {
                        setSelectedVolumetria(item);
                        setQuantidade(1);
                        setMessage("");
                        setError("");
                      }}
                    >
                      {/* Identificação da volumetria */}
                      <strong>
                        {item.volume} {item.unidade}
                      </strong>

                      <div className="mt-2">

                        {/* Preço original e desconto */}
                        {desconto > 0 && (
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <small
                              className="text-decoration-line-through"
                              style={{ opacity: 0.75 }}
                            >
                              {formatMoney(item.preco)}
                            </small>

                            <span className="badge bg-success">
                              {desconto}% OFF
                            </span>
                          </div>
                        )}

                        {/* Preço final da volumetria */}
                        <strong
                          className={
                            desconto > 0
                              ? selected
                                ? "text-white"
                                : "text-success"
                              : ""
                          }
                        >
                          {formatMoney(precoComDesconto)}
                        </strong>
                      </div>

                      {/* Estoque disponível */}
                      <small className="d-block mt-2">
                        {indisponivel
                          ? "Indisponível"
                          : `Estoque: ${item.estoque}`}
                      </small>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* preço do produto selecionado */}

          {selectedVolumetria && (
            <div className="mt-4">

              <h5 className="mb-2">
                Preço da volumetria selecionada
              </h5>

              {possuiDesconto && (
                <div className="d-flex align-items-center gap-2 mb-2">

                  {/* Preço antes da promoção */}
                  <span className="text-muted text-decoration-line-through">
                    {formatMoney(precoOriginal)}
                  </span>

                  {/* Porcentagem de desconto */}
                  <span className="badge bg-success">
                    {descontoSelecionado}% OFF
                  </span>
                </div>
              )}

              {/* Preço final */}
              <h2
                className={
                  possuiDesconto
                    ? "text-success fw-bold"
                    : "fw-bold"
                }
              >
                {formatMoney(precoFinal)}
              </h2>

              {possuiDesconto && (
                <small className="text-success">
                  Preço promocional desta volumetria.
                </small>
              )}
            </div>
          )}

          {/* quantidade */}

          {selectedVolumetria &&
            Number(selectedVolumetria.estoque) > 0 && (
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
                  step="1"
                  className="form-control"
                  value={quantidade}
                  disabled={adicionando}
                  onChange={(event) => {
                    const valor =
                      Number(event.target.value) || 1;

                    const estoque =
                      Number(selectedVolumetria.estoque);

                    setQuantidade(
                      Math.min(
                        Math.max(
                          1,
                          Math.trunc(valor)
                        ),
                        estoque
                      )
                    );
                  }}
                />
              </div>
            )}

          {/* resumo do valor*/}

          {selectedVolumetria &&
            Number(selectedVolumetria.estoque) > 0 && (
              <div className="border rounded p-3 mt-3">

                <div className="d-flex justify-content-between">
                  <span>Quantidade</span>
                  <strong>{quantidade}</strong>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <span>Preço unitário</span>
                  <strong>
                    {formatMoney(precoFinal)}
                  </strong>
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <strong>Total</strong>
                  <strong className={
                    possuiDesconto
                      ? "text-success"
                      : ""
                  }>
                    {formatMoney(
                      precoFinal * quantidade
                    )}
                  </strong>
                </div>
              </div>
            )}

          {/* Mensagens de sucesso e erro */}
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

          {/*adicionar ao carrinho */}

          <button
            type="button"
            className="btn btn-primary-gp mt-3"
            disabled={
              loading ||
              adicionando ||
              !selectedVolumetria ||
              Number(selectedVolumetria.estoque) <= 0
            }
            onClick={handleAdd}
          >
            <ShoppingCart size={18} />

            {adicionando
              ? "Adicionando..."
              : user
                ? "Adicionar ao carrinho"
                : "Entrar para comprar"}
          </button>
        </div>
      </div>
    </section>
  );
}
