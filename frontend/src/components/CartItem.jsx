import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

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

export default function CartItem({
  item,
  onUpdate,
  onRemove,
}) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <div className="row align-items-center g-3">
          <div className="col-md-5">
            <h5 className="mb-1">
              {item.produto}
            </h5>

            <p className="text-muted mb-1">
              {item.volume} {item.unidade}
            </p>

            <small className="text-muted">
              {formatMoney(item.preco)} por unidade
            </small>
          </div>

          <div className="col-md-3">
            <div className="d-flex align-items-center gap-2">
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
              >
                <Minus size={16} />
              </button>

              <strong>
                {item.quantidade}
              </strong>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onUpdate(
                    item.idCarrinhoItem,
                    Number(item.quantidade) + 1
                  );
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="col-md-2">
            <strong>
              {formatMoney(item.subtotal)}
            </strong>
          </div>

          <div className="col-md-2 text-md-end">
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => {
                onRemove(
                  item.idCarrinhoItem
                );
              }}
            >
              <Trash2 size={17} />
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
