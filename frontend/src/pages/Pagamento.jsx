import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  realizarCheckout,
} from "../services/pedidoService";

export default function Pagamento({
  cart,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const checkoutData = location.state;

  async function handleFinish() {
    if (!checkoutData?.idEndereco || !checkoutData?.formaPagamento) {
      setError(
        "Dados do checkout incompletos. Volte ao checkout."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await realizarCheckout(
        checkoutData.idEndereco,
        checkoutData.formaPagamento
      );

      setSuccess(result);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível finalizar o pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="container page-section">
        <div className="empty-state">
          <CheckCircle2 size={48} />
          <h1 className="mt-3">
            Pedido realizado!
          </h1>
          <p>
            Seu pedido foi registrado com sucesso.
          </p>
          <Link
            to="/pedidos"
            className="btn btn-primary-gp"
          >
            Acompanhar pedido
          </Link>
        </div>
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

      <h1>
        Pagamento
      </h1>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h4>
            Confirme seu pedido
          </h4>

          <p className="mb-2">
            Forma de pagamento: <strong>{checkoutData?.formaPagamento || "Não selecionada"}</strong>
          </p>

          <p className="mb-4">
            Endereço selecionado: <strong>{checkoutData?.idEndereco || "Não selecionado"}</strong>
          </p>

          <button
            type="button"
            className="btn btn-primary-gp"
            disabled={loading || cart.itens.length === 0}
            onClick={handleFinish}
          >
            {loading
              ? "Finalizando..."
              : "Finalizar pedido"}
          </button>
        </div>
      </div>
    </section>
  );
}
