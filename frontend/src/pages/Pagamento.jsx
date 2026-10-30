import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { realizarCheckout } from "../services/pedidoService";
import { getApiError } from "../services/api";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Pagamento({ cart }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Impede envios duplicados na mesma montagem
  const enviando = useRef(false);

  const checkoutData = location.state;
  const itens = Array.isArray(cart?.itens)
    ? cart.itens
    : [];

  const idEndereco = Number(
    checkoutData?.idEndereco
  );

  const formaPagamento =
    checkoutData?.formaPagamento ?? "";

  const dadosValidos =
    Number.isSafeInteger(idEndereco) &&
    idEndereco > 0 &&
    ["Pix", "Dinheiro", "Cartão"].includes(
      formaPagamento
    );

  //atualizar carrinho na entrada
  useEffect(() => {
    if (typeof cart?.loadCart === "function") {
      cart.loadCart();
    }
  }, [cart?.loadCart]);

 //finalizar pedido

  async function handleFinish() {
    if (enviando.current || success) {
      return;
    }

    if (!dadosValidos) {
      setError(
        "Dados incompletos. Volte ao checkout."
      );
      return;
    }

    if (cart?.loading || cart?.error) {
      setError(
        "Não foi possível confirmar o carrinho. Tente atualizar a página."
      );
      return;
    }

    if (itens.length === 0) {
      setError(
        "Seu carrinho está vazio."
      );
      return;
    }

    enviando.current = true;
    setLoading(true);
    setError("");

    try {
      const resultado = await realizarCheckout(
        idEndereco,
        formaPagamento
      );

      // Guarda o resultado antes de atualizar
      // os dados do carrinho
      setSuccess(resultado);

      if (typeof cart?.loadCart === "function") {
        try {
          await cart.loadCart();
        } catch (refreshError) {
          console.error(
            "Erro ao atualizar carrinho:",
            refreshError
          );
        }
      }

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível finalizar o pedido."
        )
      );

    } finally {
      enviando.current = false;
      setLoading(false);
    }
  }

  //confirmação de pagamento

  if (success) {
    return (
      <section className="container page-section">
        <div className="empty-state text-center">
          <CheckCircle2 size={48} />

          <h1 className="mt-3">
            Pedido realizado!
          </h1>

          <p>
            Seu pedido foi registrado com sucesso.
          </p>

          {success.pedido?.idPedido && (
            <p>
              Número do pedido:{" "}
              <strong>
                #{success.pedido.idPedido}
              </strong>
            </p>
          )}

          <p>
            Você pode acompanhar o andamento
            da compra na página de pedidos.
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

  //interface do pagamento
  return (
    <section className="container page-section">

      <button
        type="button"
        className="btn btn-link px-0 mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} className="me-2" />
        Voltar
      </button>

      <h1>Pagamento</h1>

      <p className="text-secondary">
        Confira os dados antes de confirmar
        seu pedido.
      </p>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      {!dadosValidos && (
        <div className="alert alert-warning mt-3">
          Os dados do checkout estão incompletos.

          <div className="mt-2">
            <Link
              to="/checkout"
              className="btn btn-outline-primary btn-sm"
            >
              Voltar ao checkout
            </Link>
          </div>
        </div>
      )}

      <div className="row g-4 mt-2">

        {/* DADOS DO PAGAMENTO */}

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <h4>Confirme seu pedido</h4>

              <p className="mb-2">
                Forma de pagamento:{" "}
                <strong>
                  {formaPagamento || "Não selecionada"}
                </strong>
              </p>

              <p className="mb-3">
                Endereço selecionado:{" "}
                <strong>
                  {idEndereco > 0
                    ? `Endereço #${idEndereco}`
                    : "Não selecionado"}
                </strong>
              </p>

              <p className="text-secondary small">
                Ao confirmar, o sistema registrará
                o pedido e atualizará o estoque
                dos produtos.
              </p>

              <p className="text-secondary small">
                Esta etapa registra a forma de
                pagamento escolhida. Ela não
                realiza uma cobrança eletrônica.
              </p>

            </div>
          </div>
        </div>

        {/* RESUMO DO PEDIDO */}

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              <h4>Resumo da compra</h4>

              {cart?.loading ? (
                <p>Atualizando carrinho...</p>
              ) : itens.length === 0 ? (
                <div className="alert alert-warning">
                  Seu carrinho está vazio.
                </div>
              ) : (
                itens.map((item) => (
                  <div
                    key={item.idCarrinhoItem}
                    className="d-flex justify-content-between gap-3 py-2 border-bottom"
                  >
                    <span>
                      {item.produto}
                      {" - "}
                      {item.volume} {item.unidade}
                      {" x "}
                      {item.quantidade}
                    </span>

                    <strong>
                      {formatMoney(item.subtotal)}
                    </strong>
                  </div>
                ))
              )}

              <div className="d-flex justify-content-between mt-3">
                <strong>Total</strong>

                <strong>
                  {formatMoney(cart?.total)}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary-gp w-100 mt-3"
                onClick={handleFinish}
                disabled={
                  loading ||
                  cart?.loading ||
                  !!cart?.error ||
                  !dadosValidos ||
                  itens.length === 0
                }
              >
                {loading
                  ? "Finalizando..."
                  : "Confirmar pedido"}
              </button>

              <Link
                to="/checkout"
                className="btn btn-link w-100 mt-2"
              >
                Alterar endereço ou pagamento
              </Link>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
