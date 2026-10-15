import {
  X,
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

export default function ProductModal({
  product,
  onClose,
}) {
  if (!product) {
    return null;
  }

  const price =
    product.precoPromocional ||
    product.preco;

  return (
    <div
      className="product-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${product.nome}`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <img
          src={product.imagem}
          alt={product.nome}
          className="modal-product-image"
        />

        <span className="section-label">
          {product.categoria || "Tintas"}
        </span>

        <h2>
          {product.nome}
        </h2>

        <p>
          {product.descricao}
        </p>

        {product.marca && (
          <p>
            <strong>Marca:</strong> {product.marca}
          </p>
        )}

        <p>
          <strong>Disponível:</strong> {product.estoque} unidade(s)
        </p>

        <strong className="modal-price">
          {formatMoney(price)}
        </strong>
      </div>
    </div>
  );
}
