import {
  useState,
} from "react";
import {
  alterarEstoque,
} from "../../services/estoqueService";

export default function Estoque({
  products,
  onStockChanged,
}) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [operacao, setOperacao] = useState("entrada");
  const [quantidade, setQuantidade] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedProduct) {
      setError("Selecione um produto.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await alterarEstoque(
        selectedProduct,
        operacao,
        quantidade,
        motivo
      );

      setMessage(
        `Estoque atualizado. Novo estoque: ${result.estoque}`
      );

      if (onStockChanged) {
        await onStockChanged();
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível alterar o estoque."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container page-section">
      <div className="section-heading">
        <div>
          <span className="section-label">
            Administração
          </span>

          <h1>
            Controle de estoque
          </h1>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Produto
                </label>

                <select
                  className="form-select"
                  value={selectedProduct}
                  required
                  onChange={(event) => {
                    setSelectedProduct(
                      event.target.value
                    );
                  }}
                >
                  <option value="">
                    Selecione um produto
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.idProduto}
                      value={product.idProduto}
                    >
                      {product.nome} - estoque atual: {product.estoque ?? 0}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">
                  Operação
                </label>

                <select
                  className="form-select"
                  value={operacao}
                  onChange={(event) => {
                    setOperacao(event.target.value);
                  }}
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

              <div className="col-md-3">
                <label className="form-label">
                  Quantidade
                </label>

                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={quantidade}
                  required
                  onChange={(event) => {
                    setQuantidade(
                      Number(event.target.value)
                    );
                  }}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Motivo
                </label>

                <input
                  className="form-control"
                  placeholder="Ex.: reposição de produtos"
                  value={motivo}
                  onChange={(event) => {
                    setMotivo(event.target.value);
                  }}
                />
              </div>
            </div>

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
              type="submit"
              className="btn btn-primary-gp mt-3"
              disabled={loading}
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
