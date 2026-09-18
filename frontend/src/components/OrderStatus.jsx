import {
  CheckCircle2,
  Clock3,
  Package,
  Truck,
} from "lucide-react";

function getStatusIcon(status) {
  const normalized = String(
    status || ""
  ).toLowerCase();

  if (normalized.includes("entreg")) {
    return <CheckCircle2 size={20} />;
  }

  if (
    normalized.includes("trans") ||
    normalized.includes("env")
  ) {
    return <Truck size={20} />;
  }

  if (
    normalized.includes("prepar") ||
    normalized.includes("process")
  ) {
    return <Package size={20} />;
  }

  return <Clock3 size={20} />;
}

export default function OrderStatus({
  pedido,
}) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-3 text-primary">
          {getStatusIcon(
            pedido.statusEntrega
          )}

          <strong>
            Pedido #{pedido.idPedido}
          </strong>
        </div>

        <p className="mb-2">
          <strong>Status:</strong>{" "}
          {pedido.statusEntrega || "Pendente"}
        </p>

        {pedido.data && (
          <p className="text-muted mb-0">
            Data: {new Date(
              pedido.data
            ).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>
    </div>
  );
}
