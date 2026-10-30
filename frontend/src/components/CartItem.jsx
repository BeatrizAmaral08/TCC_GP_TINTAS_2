import { Minus, Plus, Trash2 } from "lucide-react";

// Formata valores em reais
function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CartItem({
  item,
  onUpdate,
  onRemove,
}) {
  // Informações do preço e desconto recebidas do backend
  const precoOriginal = Number(
    item.precoOriginal ?? item.preco ?? 0
  );

  const precoFinal = Number(
    item.precoFinal ?? item.preco ?? 0
  );

  const desconto = Number(item.desconto ?? 0);

  // Verifica se existe desconto válido
  const possuiDesconto =
    desconto > 0 &&
    desconto <= 100 &&
    precoFinal < precoOriginal;

  // Subtotal retornado pelo backend
  const subtotal = Number(item.subtotal ?? 0);

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <div className="row align-items-center g-3">

          {/* Nome e volumetria do produto */}
          <div className="col-md-5">
            <h5 className="mb-1">
              {item.produto}
            </h5>

            <p className="text-muted mb-2">
              {item.volume} {item.unidade}
            </p>

            {/* Exibe o desconto, quando existente */}
            {possuiDesconto && (
              <div className="d-flex align-items-center gap-2 mb-1">
                <small className="text-muted text-decoration-line-through">
                  {formatMoney(precoOriginal)}
                </small>

                <span className="badge bg-success">
                  {desconto}% OFF
                </span>
              </div>
            )}

            {/* Preço unitário atualizado */}
            <strong
              className={
                possuiDesconto
                  ? "text-success"
                  : ""
              }
            >
              {formatMoney(precoFinal)}
            </strong>

            <small className="text-muted ms-1">
              por unidade
            </small>
          </div>

          {/* Controle de quantidade */}
          <div className="col-md-3">
            <div className="d-flex align-items-center gap-2">

              {/* Diminuir quantidade */}
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (Number(item.quantidade) > 1) {
                    onUpdate(
                      item.idCarrinhoItem,
                      Number(item.quantidade) - 1
                    );
                  }
                }}
                disabled={Number(item.quantidade) <= 1}
                aria-label="Diminuir quantidade"
              >
                <Minus size={16} />
              </button>

              <strong>
                {item.quantidade}
              </strong>

              {/* Aumentar quantidade */}
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onUpdate(
                    item.idCarrinhoItem,
                    Number(item.quantidade) + 1
                  );
                }}
                aria-label="Aumentar quantidade"
              >
                <Plus size={16} />
              </button>

            </div>
          </div>

          {/* Subtotal do item */}
          <div className="col-md-2">
            <small className="text-muted d-block mb-1">
              Subtotal
            </small>

            <strong
              className={
                possuiDesconto
                  ? "text-success"
                  : ""
              }
            >
              {formatMoney(subtotal)}
            </strong>
          </div>

          {/* Remover produto do carrinho */}
          <div className="col-md-2 text-md-end">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                onRemove(item.idCarrinhoItem);
              }}
            >
              <Trash2 size={17} className="me-1" />
              Remover
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
