import {
  useEffect,
  useState,
} from "react";
import {
  getPedidos,
} from "../services/pedidoService";
import OrderStatus from "../components/OrderStatus";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getPedidos();

        setPedidos(data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Não foi possível carregar os pedidos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <section className="container page-section">
      <div className="section-heading">
        <div>
          <span className="section-label">
            Acompanhamento
          </span>

          <h1>
            Meus pedidos
          </h1>
        </div>
      </div>

      {loading && (
        <p>Carregando pedidos...</p>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && pedidos.length === 0 && (
        <div className="empty-state">
          Você ainda não possui pedidos.
        </div>
      )}

      <div className="row g-3">
        {pedidos.map((pedido) => (
          <div
            className="col-md-6"
            key={pedido.idPedido}
          >
            <OrderStatus
              pedido={pedido}
            />

            <div className="card border-0 shadow-sm mt-2">
              <div className="card-body">
                <p className="mb-0">
                  <strong>Forma de pagamento:</strong>{" "}
                  {pedido.formaPagamento}
                </p>

                <p className="mb-0 mt-2">
                  <strong>Total:</strong>{" "}
                  {Number(
                    pedido.valorTotal || 0
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
