import { CheckCircle2, Clock3, Package, Truck } from "lucide-react";

//configuração dos status

function getStatusInfo(status) {
  const normalized = String(
    status || "Pendente"
  ).trim().toLowerCase();

  if (normalized === "entregue") {
    return {
      label: "Entregue",
      icon: CheckCircle2,
      color: "text-success",
      description: "Seu pedido foi entregue.",
    };
  }

  if (normalized === "enviado") {
    return {
      label: "Enviado",
      icon: Truck,
      color: "text-primary",
      description: "Seu pedido foi enviado.",
    };
  }

  if (
    normalized === "em separação" ||
    normalized === "em separacao"
  ) {
    return {
      label: "Em Separação",
      icon: Package,
      color: "text-warning",
      description: "Estamos preparando seu pedido.",
    };
  }

  if (normalized === "pendente") {
    return {
      label: "Pendente",
      icon: Clock3,
      color: "text-secondary",
      description: "Seu pedido foi registrado.",
    };
  }

  return {
    label: status || "Status desconhecido",
    icon: Clock3,
    color: "text-secondary",
    description: "Acompanhe as atualizações do seu pedido.",
  };
}

//formatar data
function formatDate(value) {
  if (!value) return "";

  // Preserva datas no formato YYYY-MM-DD
  // sem alterações causadas pelo fuso horário.
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const data = new Date(value);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

//componente ordes status

export default function OrderStatus({ pedido }) {
  const status = getStatusInfo(
    pedido?.statusEntrega
  );

  const StatusIcon = status.icon;

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">

        <div className={`d-flex align-items-center gap-2 mb-3 ${status.color}`}>
          <StatusIcon size={22} />

          <strong>
            Pedido #{pedido?.idPedido}
          </strong>
        </div>

        <p className="mb-2">
          <strong>Status:</strong>{" "}
          <span className={status.color}>
            {status.label}
          </span>
        </p>

        <p className="text-secondary small mb-2">
          {status.description}
        </p>

        {pedido?.data && (
          <p className="text-muted mb-0">
            <strong>Data:</strong>{" "}
            {formatDate(pedido.data)}
          </p>
        )}

      </div>
    </div>
  );
}