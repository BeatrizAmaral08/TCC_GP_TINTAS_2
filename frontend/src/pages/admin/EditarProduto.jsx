import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Descontos from "../../components/Descontos";
import { getApiError } from "../../services/api";
import { getProductById, updateProduct } from "../../services/productService";
import { getVolumetrias } from "../../services/volumetriaService";

// Dados iniciais do formulário
const initialForm = {
  idCategoria: "",
  nome: "",
  descricao: "",
  marca: "",
  preco: "",
  estoqueMinimo: "",
  unidade: "",
  imagemPrincipal: null,
  imagemLata: null,
  imagemCor: null,
  imagemSala: null,
  imagemQuarto: null,
  imagemCozinha: null,
  imagemQuintal: null,
};

export default function EditarProduto() {
  const { id } = useParams();

  // Estados do produto e do formulário
  const [produto, setProduto] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [volumetrias, setVolumetrias] = useState([]);

  // Estados de carregamento e mensagens
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [loadingVolumes, setLoadingVolumes] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Carrega as volumetrias do produto
  const carregarVolumetrias = useCallback(async () => {
    setLoadingVolumes(true);

    try {
      // Inclui volumetrias inativas para administração
      const dados = await getVolumetrias(id, true);
      setVolumetrias(dados);
    } finally {
      setLoadingVolumes(false);
    }
  }, [id]);

  // Busca os dados do produto
  useEffect(() => {
    let ativo = true;

    async function carregarProduto() {
      setLoading(true);
      setError("");

      try {
        const [dadosProduto, dadosCategorias, dadosVolumes] =
          await Promise.all([
            getProductById(id),
            // Busca as categorias existentes
            import("../../services/productService")
              .then((service) => service.getCategories()),
            getVolumetrias(id, true),
          ]);

        if (!ativo) return;

        setProduto(dadosProduto);
        setCategorias(dadosCategorias);
        setVolumetrias(dadosVolumes);

        // Preenche o formulário para edição
        setForm({
          ...initialForm,
          idCategoria: String(dadosProduto.categoriaId),
          nome: dadosProduto.nome || "",
          descricao: dadosProduto.descricao || "",
          marca: dadosProduto.marca || "",
          preco: String(dadosProduto.preco ?? ""),
          estoqueMinimo: String(
            dadosProduto.estoqueMinimo ?? 0
          ),
          unidade: dadosProduto.unidade || "UN",
        });

      } catch (requestError) {
        if (ativo) {
          setError(
            getApiError(
              requestError,
              "Não foi possível carregar o produto."
            )
          );
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarProduto();

    return () => {
      ativo = false;
    };
  }, [id]);

  // Atualiza os campos do formulário
  function updateField(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  // Salva as alterações do produto
  async function handleSubmit(event) {
    event.preventDefault();

    if (salvando || !produto) return;

    setSalvando(true);
    setError("");
    setMessage("");

    try {
      const atualizado = await updateProduct(id, {
        ...form,
        idCategoria: Number(form.idCategoria),
        preco: Number(form.preco),
        estoqueMinimo: Number(form.estoqueMinimo),
      });

      setProduto(atualizado);

      setMessage(
        "Produto atualizado com sucesso!"
      );

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível atualizar o produto."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  // Campo reutilizável de upload de imagens
  function campoImagem(nome, titulo) {
    return (
      <div className="col-md-6" key={nome}>
        <label className="form-label">
          {titulo}
        </label>

        <input
          type="file"
          accept="image/*"
          className="form-control"
          disabled={salvando}
          onChange={(event) =>
            updateField(
              nome,
              event.target.files?.[0] || null
            )
          }
        />
      </div>
    );
  }

  // Identifica produtos da categoria de tintas
  const ehTinta = Boolean(
    categorias
      .find((categoria) =>
        String(categoria.id) ===
        String(form.idCategoria)
      )
      ?.nome?.toLowerCase()
      .includes("tinta")
  );

  // Exibe carregamento
  if (loading) {
    return (
      <section className="container page-section">
        <p>Carregando produto...</p>
      </section>
    );
  }

  // Exibe erro quando o produto não foi carregado
  if (!produto) {
    return (
      <section className="container page-section">
        <div className="alert alert-danger">
          {error || "Produto não encontrado."}
        </div>

        <Link to="/admin/produtos">
          Voltar ao cadastro de produtos
        </Link>
      </section>
    );
  }

  return (
    <section className="container admin-section">

      {/* Cabeçalho da página */}
      <div className="admin-heading">
        <div>
          <span className="section-label">
            Área administrativa
          </span>

          <h1>Editar produto</h1>

          <p>
            Atualize as informações e promoções
            do produto #{produto.id}.
          </p>
        </div>

        <Link
          to="/admin/produtos"
          className="btn btn-outline-secondary"
        >
          <ArrowLeft size={17} className="me-2" />
          Voltar
        </Link>
      </div>

      <div className="admin-card">

        {/* Mensagens de sucesso e erro */}
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Formulário de edição */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            {/* Nome */}
            <div className="col-md-6">
              <label className="form-label">
                Nome
              </label>

              <input
                className="form-control"
                value={form.nome}
                required
                onChange={(event) =>
                  updateField("nome", event.target.value)
                }
              />
            </div>

            {/* Categoria */}
            <div className="col-md-3">
              <label className="form-label">
                Categoria
              </label>

              <select
                className="form-select"
                value={form.idCategoria}
                required
                onChange={(event) =>
                  updateField(
                    "idCategoria",
                    event.target.value
                  )
                }
              >
                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div className="col-md-3">
              <label className="form-label">
                Marca
              </label>

              <input
                className="form-control"
                value={form.marca}
                onChange={(event) =>
                  updateField("marca", event.target.value)
                }
              />
            </div>

            {/* Descrição */}
            <div className="col-12">
              <label className="form-label">
                Descrição
              </label>

              <textarea
                className="form-control"
                rows="3"
                value={form.descricao}
                onChange={(event) =>
                  updateField(
                    "descricao",
                    event.target.value
                  )
                }
              />
            </div>

            {/* Preço base do produto */}
            <div className="col-md-4">
              <label className="form-label">
                Preço base (R$)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.preco}
                required
                onChange={(event) =>
                  updateField("preco", event.target.value)
                }
              />
              {ehTinta && (
                <small className="text-secondary">
                  Os preços de cada volumetria
                  são armazenados separadamente.
                </small>
              )}
            </div>

            {/* Estoque mínimo */}
            <div className="col-md-4">
              <label className="form-label">
                Estoque mínimo
              </label>

              <input
                type="number"
                min="0"
                step="1"
                className="form-control"
                value={form.estoqueMinimo}
                onChange={(event) =>
                  updateField(
                    "estoqueMinimo",
                    event.target.value
                  )
                }
              />
            </div>

            {/* Unidade */}
            <div className="col-md-4">
              <label className="form-label">
                Unidade
              </label>

              <input
                className="form-control"
                value={form.unidade}
                onChange={(event) =>
                  updateField(
                    "unidade",
                    event.target.value
                  )
                }
              />
            </div>

            {/* Imagens do produto */}
            <div className="col-12">
              <hr />
              <h5>Atualizar imagens</h5>

              <p className="text-secondary small">
                Selecione apenas as imagens
                que deseja substituir.
              </p>

              <div className="row g-3">
                {ehTinta ? (
                  <>
                    {campoImagem(
                      "imagemLata",
                      "Foto da lata"
                    )}
                    {campoImagem(
                      "imagemCor",
                      "Foto da cor"
                    )}
                    {campoImagem(
                      "imagemSala",
                      "Foto da sala"
                    )}
                    {campoImagem(
                      "imagemQuarto",
                      "Foto do quarto"
                    )}
                    {campoImagem(
                      "imagemCozinha",
                      "Foto da cozinha"
                    )}
                    {campoImagem(
                      "imagemQuintal",
                      "Foto do quintal"
                    )}
                  </>
                ) : (
                  campoImagem(
                    "imagemPrincipal",
                    "Foto principal"
                  )
                )}
              </div>
            </div>
          </div>

          {/* Salva os dados principais */}
          <button
            type="submit"
            className="btn btn-primary-gp mt-4"
            disabled={salvando}
          >
            <Save size={18} className="me-2" />
            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
          </button>
        </form>

        {/* Gerenciamento dos descontos */}
        {ehTinta && (
          <>
            <hr className="my-4" />

            {loadingVolumes ? (
              <p>Carregando volumetrias...</p>
            ) : (
              <Descontos
                idProduto={Number(id)}
                volumetrias={volumetrias}
                onAtualizar={carregarVolumetrias}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
