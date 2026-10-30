import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { getPedidos } from "../services/pedidoService";
import { getApiError } from "../services/api";
import OrderStatus from "../components/OrderStatus";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //carregar pedidos
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPedidos();

      if (!Array.isArray(data)) {
        throw new Error(
          "Resposta inválida ao carregar pedidos."
        );
      }

      setPedidos(data);

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível carregar os pedidos."
        )
      );

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);


  return (
    <section className="container page-section">

      <div className="section-heading d-flex justify-content-between align-items-center gap-3">
        <div>
          <span className="section-label">
            Acompanhamento
          </span>

          <h1>Meus pedidos</h1>

          <p className="text-secondary mb-0">
            Confira suas compras e acompanhe
            o andamento dos pedidos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadOrders}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className="me-2"
          />
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* CARREGAMENTO */}

      {loading && (
        <p className="mt-4">
          Carregando pedidos...
        </p>
      )}

      {/* MENSAGEM DE ERRO */}

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      {/* SEM PEDIDOS */}

      {!loading && !error && pedidos.length === 0 && (
        <div className="empty-state text-center mt-4">
          <ShoppingBag size={42} />

          <h4 className="mt-3">
            Nenhum pedido encontrado
          </h4>

          <p>
            Você ainda não realizou nenhuma compra.
          </p>

          <Link
            to="/produtos"
            className="btn btn-primary-gp mt-2"
          >
            Ver produtos
          </Link>
        </div>
      )}

      {/* LISTA DE PEDIDOS */}

      {!loading && !error && pedidos.length > 0 && (
        <div className="row g-3 mt-2">
          {pedidos.map((pedido) => (
            <div
              className="col-md-6"
              key={pedido.idPedido}
            >
              <OrderStatus pedido={pedido} />

              <div className="card border-0 shadow-sm mt-2">
                <div className="card-body">

                  <p className="mb-2">
                    <strong>
                      Pedido #{pedido.idPedido}
                    </strong>
                  </p>

                  <p className="mb-2">
                    <strong>Forma de pagamento:</strong>{" "}
                    {pedido.formaPagamento}
                  </p>

                  <p className="mb-0">
                    <strong>Total:</strong>{" "}
                    {formatMoney(pedido.valorTotal)}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
