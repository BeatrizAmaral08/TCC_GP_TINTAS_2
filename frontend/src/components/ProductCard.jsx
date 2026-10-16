import {
  Eye,
} from "lucide-react";
import fallbackImage from "../assets/logo/gp-tintas-logo.svg";

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

export default function ProductCard({
  product,
  onSelectProduct,
}) {
  const price =
    product.precoPromocional ||
    product.preco;

  return (
    <div className="product-card h-100">
      <div className="product-image-wrapper">
        <img
          src={product.imagem || fallbackImage}
          alt={product.nome}
          className="product-image"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />

        {Number(product.estoque) === 0 && (
          <span className="status-badge status-badge-error">
            Indisponível
          </span>
        )}
      </div>

      <div className="product-content">
        <span className="product-category">
          {product.categoria || "Tintas"}
        </span>

        <h2 className="product-title">
          {product.nome}
        </h2>

        <p className="product-description">
          {product.descricao || "Conheça este produto GPTintas."}
        </p>

        <strong className="product-price">
          {formatMoney(price)}
        </strong>

        <button
          type="button"
          className="btn btn-primary-gp mt-3"
          onClick={() => {
            onSelectProduct(
              product
            );
          }}
        >
          <Eye size={18} />
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
