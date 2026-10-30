import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { alterarEstoque } from "../../services/estoqueService";
import { getVolumetrias } from "../../services/volumetriaService";
import { getApiError } from "../../services/api";


// Formata a volumetria para exibição
function formatarVolume(volume) {
  return `${volume.volume} ${volume.unidade}`;
}

export default function Estoque({
  products = [],
  onStockChanged,
}) {
  // Estados do formulário
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVolume, setSelectedVolume] = useState("");
  const [volumetrias, setVolumetrias] = useState([]);
  const [operacao, setOperacao] = useState("entrada");
  const [quantidade, setQuantidade] = useState(1);
  const [motivo, setMotivo] = useState("");

  // Estados de carregamento e mensagens
  const [loading, setLoading] = useState(false);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [erroVolumes, setErroVolumes] = useState(false);

  // Identifica o produto selecionado
  const produtoSelecionado = products.find(
    (produto) =>
      String(produto.id ?? produto.idProduto) ===
      String(selectedProduct)
  );

  // Busca as volumetrias quando o produto muda
  useEffect(() => {
    let ativo = true;

    setSelectedVolume("");
    setVolumetrias([]);
    setErroVolumes(false);
    setError("");
    setMessage("");

    if (!selectedProduct) {
      setLoadingVolumes(false);
      return;
    }

    setLoadingVolumes(true);

    async function carregarVolumetrias() {
      try {
        // Inclui as volumetrias inativas no painel
        const dados = await getVolumetrias(
          selectedProduct,
          true
        );

        if (ativo) {
          setVolumetrias(dados);
        }
      } catch (requestError) {
        if (ativo) {
          setErroVolumes(true);

          setError(
            getApiError(
              requestError,
              "Não foi possível carregar as volumetrias."
            )
          );
        }
      } finally {
        if (ativo) {
          setLoadingVolumes(false);
        }
      }
    }

    carregarVolumetrias();

    // Evita atualizar dados de um produto anterior
    return () => {
      ativo = false;
    };
  }, [selectedProduct]);

  // Obtém a volumetria selecionada
  const volumeSelecionado = volumetrias.find(
    (volume) =>
      String(volume.id ?? volume.idProdutoVolumetria) ===
      String(selectedVolume)
  );

  // Verifica se o produto possui volumetrias
  const possuiVolumetrias = volumetrias.length > 0;

  // Verifica se o formulário pode ser enviado
  const formularioBloqueado =
    loading ||
    loadingVolumes ||
    erroVolumes ||
    !selectedProduct ||
    (possuiVolumetrias && !selectedVolume);

  // Envia a movimentação para o backend
  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || loadingVolumes) return;

    setMessage("");
    setError("");

    // Valida o produto selecionado
    if (!selectedProduct) {
      setError("Selecione um produto.");
      return;
    }

    // Impede alterações se a consulta de volumes falhar
    if (erroVolumes) {
      setError(
        "Não foi possível verificar as volumetrias do produto."
      );
      return;
    }

    // Exige uma volumetria quando o produto possui volumes
    if (possuiVolumetrias && !selectedVolume) {
      setError("Selecione uma volumetria.");
      return;
    }

    const qtd = Number(quantidade);

    // Valida a quantidade informada
    if (
      quantidade === "" ||
      !Number.isSafeInteger(qtd) ||
      qtd < 0 ||
      (operacao !== "definir" && qtd === 0)
    ) {
      setError("Informe uma quantidade válida.");
      return;
    }

    setLoading(true);

    try {
      // Envia a movimentação para o backend
      const result = await alterarEstoque(
        Number(selectedProduct),
        operacao,
        qtd,
        motivo,
        selectedVolume
          ? Number(selectedVolume)
          : null
      );

      // Exibe o novo estoque retornado pela API
      setMessage(
        `Estoque atualizado com sucesso! Novo estoque: ${result.estoque}`
      );

      // Limpa os campos de quantidade e motivo
      setQuantidade(1);
      setMotivo("");

      // Atualiza o estoque da volumetria na tela
      if (selectedVolume) {
        setVolumetrias((atual) =>
          atual.map((volume) =>
            String(volume.id ?? volume.idProdutoVolumetria) ===
              String(selectedVolume)
              ? {
                ...volume,
                estoque: result.estoque,
              }
              : volume
          )
        );
      }

      // Atualiza o catálogo de produtos
      if (typeof onStockChanged === "function") {
        try {
          await onStockChanged();
        } catch (refreshError) {
          console.error(
            "Erro ao atualizar produtos:",
            refreshError
          );
        }
      }

    } catch (requestError) {
      // Exibe a mensagem de erro
      setError(
        getApiError(
          requestError,
          "Não foi possível alterar o estoque."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container page-section">

      {/* Título da página */}
      <div className="section-heading">
        <div>
          <span className="section-label">
            Administração
          </span>

          <h1>Controle de estoque</h1>

          <p className="text-secondary">
            Registre entradas, saídas e ajustes
            de produtos e volumetrias.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">

          {/* Formulário de movimentação */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Seleção do produto */}
              <div className="col-md-6">
                <label className="form-label">
                  Produto
                </label>

                <select
                  className="form-select"
                  value={selectedProduct}
                  required
                  disabled={loading || loadingVolumes}
                  onChange={(event) =>
                    setSelectedProduct(event.target.value)
                  }
                >
                  <option value="">
                    Selecione um produto
                  </option>

                  {products.map((produto) => {
                    const id =
                      produto.id ?? produto.idProduto;

                    return (
                      <option key={id} value={id}>
                        {produto.nome} — Estoque: {produto.estoque ?? 0}
                      </option>
                    );
                  })}
                </select>
              </div>


              {/* Botão para editar o produto selecionado */}
              {selectedProduct && (
                <div className="col-12">
                  <Link
                    to={`/admin/produtos/editar/${selectedProduct}`}
                    className="btn btn-outline-primary"
                  >
                    <Pencil size={17} className="me-2" />
                    Editar produto e descontos
                  </Link>
                </div>
              )}

              
              {/* Seleção da volumetria */}
              <div className="col-md-6">
                <label className="form-label">
                  Volumetria
                </label>

                <select
                  className="form-select"
                  value={selectedVolume}
                  disabled={
                    !selectedProduct ||
                    loading ||
                    loadingVolumes ||
                    erroVolumes ||
                    !possuiVolumetrias
                  }
                  required={possuiVolumetrias}
                  onChange={(event) =>
                    setSelectedVolume(event.target.value)
                  }
                >
                  <option value="">
                    {loadingVolumes
                      ? "Carregando volumes..."
                      : erroVolumes
                        ? "Erro ao carregar volumes"
                        : !possuiVolumetrias
                          ? "Produto sem volumetrias"
                          : "Selecione um volume"}
                  </option>

                  {/* Lista volumes ativos e inativos */}
                  {volumetrias.map((volume) => {
                    const id =
                      volume.id ??
                      volume.idProdutoVolumetria;

                    // O MySQL pode retornar ativo como 1 ou 0
                    const inativa =
                      volume.ativo === false ||
                      Number(volume.ativo) === 0;

                    return (
                      <option key={id} value={id}>
                        {formatarVolume(volume)}
                        {" — Estoque: "}
                        {volume.estoque}
                        {inativa ? " (Inativa)" : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Informação sobre as volumetrias inativas */}
                {volumeSelecionado &&
                  (
                    volumeSelecionado.ativo === false ||
                    Number(volumeSelecionado.ativo) === 0
                  ) && (
                    <small className="text-warning d-block mt-2">
                      Esta volumetria está inativa
                      para vendas, mas seu estoque
                      pode ser ajustado.
                    </small>
                  )}
              </div>

              {/* Operação de estoque */}
              <div className="col-md-4">
                <label className="form-label">
                  Operação
                </label>

                <select
                  className="form-select"
                  value={operacao}
                  disabled={loading}
                  onChange={(event) =>
                    setOperacao(event.target.value)
                  }
                >
                  <option value="entrada">
                    Entrada
                  </option>

                  <option value="saida">
                    Saída
                  </option>

                  <option value="definir">
                    Definir estoque
                  </option>
                </select>
              </div>

              {/* Quantidade da movimentação */}
              <div className="col-md-4">
                <label className="form-label">
                  Quantidade
                </label>

                <input
                  type="number"
                  min={operacao === "definir" ? 0 : 1}
                  step="1"
                  className="form-control"
                  value={quantidade}
                  required
                  disabled={loading}
                  onChange={(event) =>
                    setQuantidade(event.target.value)
                  }
                />
              </div>

              {/* Estoque atual do produto ou volumetria */}
              <div className="col-md-4">
                <label className="form-label">
                  Estoque atual
                </label>

                <input
                  className="form-control"
                  value={
                    possuiVolumetrias
                      ? volumeSelecionado?.estoque ?? ""
                      : produtoSelecionado?.estoque ?? ""
                  }
                  readOnly
                />
              </div>

              {/* Motivo da movimentação */}
              <div className="col-12">
                <label className="form-label">
                  Motivo
                </label>

                <input
                  className="form-control"
                  placeholder="Ex.: reposição de produtos"
                  value={motivo}
                  disabled={loading}
                  onChange={(event) =>
                    setMotivo(event.target.value)
                  }
                />
              </div>
            </div>

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

            {/* Botão para registrar a movimentação */}
            <button
              type="submit"
              className="btn btn-primary-gp mt-3"
              disabled={formularioBloqueado}
            >
              {loading
                ? "Atualizando..."
                : "Atualizar estoque"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
