import {
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import CartItem from "../components/CartItem";

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

export default function Carrinho({
  cart,
  updateItem,
  removeItem,
}) {
  const navigate = useNavigate();

  if (cart.loading) {
    return (
      <section className="container page-section">
        <p>Carregando carrinho...</p>
      </section>
    );
  }

  return (
    <section className="container page-section">
      <div className="section-heading">
        <div>
          <span className="section-label">
            Compra
          </span>

          <h1>
            Meu carrinho
          </h1>
        </div>
      </div>

      {cart.error && (
        <div className="alert alert-danger">
          {cart.error}
        </div>
      )}

      {cart.itens.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={40} />
          <h3 className="mt-3">
            Seu carrinho está vazio.
          </h3>
          <p>
            Escolha uma tinta no catálogo para começar sua compra.
          </p>
          <Link
            to="/"
            className="btn btn-primary-gp"
          >
            Ver produtos
          </Link>
        </div>
      ) : (
        <>
          <div>
            {cart.itens.map((item) => (
              <CartItem
                key={item.idCarrinhoItem}
                item={item}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5">
                  Total
                </span>

                <strong className="fs-4">
                  {formatMoney(cart.total)}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary-gp mt-3"
                onClick={() => {
                  navigate("/checkout");
                }}
              >
                Ir para checkout
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
