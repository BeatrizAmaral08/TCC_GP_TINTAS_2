import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductModal({
  product,
  onClose,
}) {
  // Não exibe o modal sem produto
  if (!product) {
    return null;
  }

  // Identifica o produto
  const productId =
    product.id ?? product.idProduto;

  // Preço promocional ou original
  const price =
    product.precoPromocional ?? product.preco;

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
        {/* Fechar modal */}
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Imagem */}
        {product.imagem && (
          <img
            src={product.imagem}
            alt={product.nome}
            className="modal-product-image"
          />
        )}

        {/* Categoria */}
        <span className="section-label">
          {product.categoria || "Tintas"}
        </span>

        {/* Nome */}
        <h2>{product.nome}</h2>

        {/* Descrição */}
        <p>
          {product.descricao ||
            "Conheça os detalhes deste produto."}
        </p>

        {/* Marca */}
        {product.marca && (
          <p>
            <strong>Marca:</strong> {product.marca}
          </p>
        )}

        {/* Estoque */}
        <p>
          <strong>Disponível:</strong>{" "}
          {product.estoque ?? 0} unidade(s)
        </p>

        {/* Preço */}
        <strong className="modal-price">
          {formatMoney(price)}
        </strong>

        {/* Abrir página completa do produto */}
        {productId != null && (
          <Link
            to={`/produto/${productId}`}
            className="btn btn-primary-gp mt-3"
            onClick={onClose}
          >
            Escolher volumetria
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
