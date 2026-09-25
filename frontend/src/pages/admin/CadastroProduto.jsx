import {
  PackagePlus,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  getApiError,
} from "../../services/api";
import {
  createProduct,
} from "../../services/productService";

const initialForm = {
  idCategoria: "",
  nome: "",
  descricao: "",
  marca: "",
  preco: "",
  estoque: 0,
  estoqueMinimo: 5,
  unidade: "UN",
  imagemArquivo: null,
};

export default function CadastroProduto({
  categories,
  onProductCreated,
}) {
  const [form, setForm] = useState(
    initialForm
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      form.idCategoria ||
      !categories[0]
    ) {
      return;
    }

    setForm((currentForm) => {
      return {
        ...currentForm,
        idCategoria: String(
          categories[0].id
        ),
      };
    });
  }, [
    categories,
    form.idCategoria,
  ]);

  function updateField(
    field,
    value
  ) {
    setForm((currentForm) => {
      return {
        ...currentForm,
        [field]: value,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage(
      ""
    );

    setError(
      ""
    );

    setLoading(
      true
    );

    try {
      await createProduct({
        idCategoria: Number(
          form.idCategoria
        ),
        nome: form.nome,
        descricao: form.descricao,
        marca: form.marca,
        preco: Number(
          form.preco
        ),
        estoque: Number(
          form.estoque
        ),
        estoqueMinimo: Number(
          form.estoqueMinimo
        ),
        unidade: form.unidade,
        imagemArquivo: form.imagemArquivo,
      });

      setMessage(
        "Produto cadastrado com sucesso."
      );

      setForm({
        ...initialForm,
        idCategoria: categories[0]
          ? String(categories[0].id)
          : "",
      });

      await onProductCreated();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível cadastrar o produto."
        )
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  return (
    <section className="container admin-section">
      <div className="admin-heading">
        <div>
          <span className="section-label">
            Área administrativa
          </span>

          <h1>
            Cadastrar produto
          </h1>

          <p>
            Adicione um novo produto ao catálogo da GPTintas.
          </p>
        </div>
      </div>

      <div className="admin-card">
        {message && (
          <div className="feedback feedback-success">
            {message}
          </div>
        )}

        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Nome
              </label>

              <input
                className="form-control"
                value={form.nome}
                onChange={(event) => {
                  updateField(
                    "nome",
                    event.target.value
                  );
                }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Categoria
              </label>

              <select
                className="form-select"
                value={form.idCategoria}
                onChange={(event) => {
                  updateField(
                    "idCategoria",
                    event.target.value
                  );
                }}
                required
              >
                <option value="">
                  Selecione
                </option>

                {categories.map((category) => {
                  return (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.nome}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Marca
              </label>

              <input
                className="form-control"
                value={form.marca}
                onChange={(event) => {
                  updateField(
                    "marca",
                    event.target.value
                  );
                }}
              />
            </div>

            <div className="col-12">
              <label className="form-label">
                Descrição
              </label>

              <textarea
                className="form-control"
                rows="3"
                value={form.descricao}
                onChange={(event) => {
                  updateField(
                    "descricao",
                    event.target.value
                  );
                }}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Preço
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.preco}
                onChange={(event) => {
                  updateField(
                    "preco",
                    event.target.value
                  );
                }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Estoque
              </label>

              <input
                type="number"
                min="0"
                className="form-control"
                value={form.estoque}
                onChange={(event) => {
                  updateField(
                    "estoque",
                    event.target.value
                  );
                }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Estoque mínimo
              </label>

              <input
                type="number"
                min="0"
                className="form-control"
                value={form.estoqueMinimo}
                onChange={(event) => {
                  updateField(
                    "estoqueMinimo",
                    event.target.value
                  );
                }}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Unidade
              </label>

              <input
                className="form-control"
                value={form.unidade}
                onChange={(event) => {
                  updateField(
                    "unidade",
                    event.target.value
                  );
                }}
              />
            </div>

            <div className="col-12">
              <label className="form-label">
                Imagem
              </label>

              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => {
                  updateField(
                    "imagemArquivo",
                    event.target.files?.[0] || null
                  );
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-gp mt-4"
            disabled={loading}
          >
            <PackagePlus size={18} />

            {loading
              ? "Cadastrando..."
              : "Cadastrar produto"}
          </button>
        </form>
      </div>
    </section>
  );
}
