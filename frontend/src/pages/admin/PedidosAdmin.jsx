import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Package, RefreshCw, Search, ShoppingBag, Truck } from "lucide-react";
import api, { getApiError } from "../../services/api";

const STATUS = [
  "Pendente",
  "Em Separação",
  "Enviado",
  "Entregue",
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value) {
  if (!value) return "-";

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return "-";
}

function StatusBadge({ status }) {
  const estilos = {
    Pendente: "bg-secondary-subtle text-secondary-emphasis",
    "Em Separação": "bg-warning-subtle text-warning-emphasis",
    Enviado: "bg-primary-subtle text-primary-emphasis",
    Entregue: "bg-success-subtle text-success-emphasis",
  };

  return (
    <span
      className={`badge rounded-pill px-3 py-2 ${
        estilos[status] ||
        "bg-secondary-subtle text-secondary-emphasis"
      }`}
    >
      {status || "Desconhecido"}
    </span>
  );
}

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [alteracoes, setAlteracoes] = useState({});
  const [loading, setLoading] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

 //carregar pedidos

  const carregarPedidos = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.get(
        "/pedidos/admin/todos"
      );

      if (!Array.isArray(response.data)) {
        throw new Error(
          "Resposta inválida ao carregar pedidos."
        );
      }

      setPedidos(response.data);

      const valores = {};

      response.data.forEach((pedido) => {
        valores[pedido.idPedido] =
          pedido.statusEntrega;
      });

      setAlteracoes(valores);

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível carregar os pedidos."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  //alterar status

  function selecionarStatus(idPedido, status) {
    setAlteracoes((atual) => ({
      ...atual,
      [idPedido]: status,
    }));
  }

  async function salvarStatus(pedido) {
    if (salvandoId !== null) return;

    const idPedido = Number(pedido.idPedido);
    const novoStatus = alteracoes[idPedido];

    if (!STATUS.includes(novoStatus)) {
      setError("Selecione um status válido.");
      return;
    }

    if (novoStatus === pedido.statusEntrega) {
      return;
    }

    setSalvandoId(idPedido);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/pedidos/admin/${idPedido}/status`,
        {
          statusEntrega: novoStatus,
        }
      );

      const atualizado = response.data?.pedido;

      setPedidos((atual) =>
        atual.map((item) =>
          Number(item.idPedido) === idPedido
            ? {
                ...item,
                statusEntrega:
                  atualizado?.statusEntrega ||
                  novoStatus,
              }
            : item
        )
      );

      setSuccess(
        `Status do pedido #${idPedido} atualizado com sucesso.`
      );

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível atualizar o status."
        )
      );
    } finally {
      setSalvandoId(null);
    }
  }

  //resumo dos pedidos
  const indicadores = [
    {
      titulo: "Total de pedidos",
      valor: pedidos.length,
      Icone: ShoppingBag,
      cor: "text-primary",
    },
    {
      titulo: "Pendentes",
      valor: pedidos.filter(
        (p) => p.statusEntrega === "Pendente"
      ).length,
      Icone: Clock3,
      cor: "text-secondary",
    },
    {
      titulo: "Em separação",
      valor: pedidos.filter(
        (p) => p.statusEntrega === "Em Separação"
      ).length,
      Icone: Package,
      cor: "text-warning",
    },
    {
      titulo: "Enviados",
      valor: pedidos.filter(
        (p) => p.statusEntrega === "Enviado"
      ).length,
      Icone: Truck,
      cor: "text-primary",
    },
    {
      titulo: "Entregues",
      valor: pedidos.filter(
        (p) => p.statusEntrega === "Entregue"
      ).length,
      Icone: CheckCircle2,
      cor: "text-success",
    },
  ];

  //filtro de pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const pesquisa = busca.trim().toLowerCase();

    const correspondeBusca =
      !pesquisa ||
      String(pedido.idPedido).includes(pesquisa) ||
      String(pedido.idCliente).includes(pesquisa);

    const correspondeStatus =
      filtroStatus === "Todos" ||
      pedido.statusEntrega === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  //interface 

  return (
    <section className="container page-section">

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="section-label">
            Administração
          </span>

          <h1 className="mb-1">
            Gerenciar pedidos
          </h1>

          <p className="text-secondary mb-0">
            Acompanhe as vendas e atualize
            o andamento dos pedidos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={carregarPedidos}
          disabled={loading || salvandoId !== null}
        >
          <RefreshCw size={17} className="me-2" />
          {loading ? "Atualizando..." : "Atualizar pedidos"}
        </button>
      </div>

      {/* MENSAGENS */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* INDICADORES */}

      <div className="row g-3 mb-4">
        {indicadores.map((indicador) => {
          const Icone = indicador.Icone;

          return (
            <div
              className="col-6 col-lg"
              key={indicador.titulo}
            >
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  <Icone
                    size={24}
                    className={indicador.cor}
                  />

                  <h3 className="mt-3 mb-1">
                    {indicador.valor}
                  </h3>

                  <span className="text-secondary small">
                    {indicador.titulo}
                  </span>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTROS */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-8">
              <label className="form-label">
                Buscar pedido
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>

                <input
                  type="search"
                  className="form-control"
                  placeholder="Número do pedido ou ID do cliente"
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Filtrar por status
              </label>

              <select
                className="form-select"
                value={filtroStatus}
                onChange={(event) =>
                  setFiltroStatus(event.target.value)
                }
              >
                <option value="Todos">
                  Todos os status
                </option>

                {STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* LISTAGEM */}

      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              Pedidos da loja
            </h4>

            <span className="text-secondary small">
              {pedidosFiltrados.length} pedido(s)
            </span>
          </div>

          {loading ? (
            <p>Carregando pedidos...</p>
          ) : !error && pedidos.length === 0 ? (
            <div className="empty-state">
              Nenhum pedido registrado.
            </div>
          ) : !error && pedidosFiltrados.length === 0 ? (
            <div className="alert alert-warning">
              Nenhum pedido encontrado com esses filtros.
            </div>
          ) : !error && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Status atual</th>
                    <th>Alterar status</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map((pedido) => {
                    const novoStatus =
                      alteracoes[pedido.idPedido] ??
                      pedido.statusEntrega;

                    const alterado =
                      novoStatus !== pedido.statusEntrega;

                    const salvando =
                      salvandoId === Number(pedido.idPedido);

                    return (
                      <tr key={pedido.idPedido}>
                        <td>
                          <strong>
                            #{pedido.idPedido}
                          </strong>
                        </td>

                        <td>
                          #{pedido.idCliente}
                        </td>

                        <td>
                          {formatDate(pedido.data)}
                        </td>

                        <td>
                          {pedido.formaPagamento}
                        </td>

                        <td>
                          <strong>
                            {formatMoney(pedido.valorTotal)}
                          </strong>
                        </td>

                        <td>
                          <StatusBadge
                            status={pedido.statusEntrega}
                          />
                        </td>

                        <td style={{ minWidth: 210 }}>
                          <select
                            className="form-select form-select-sm mb-2"
                            value={novoStatus}
                            disabled={salvandoId !== null}
                            onChange={(event) =>
                              selecionarStatus(
                                pedido.idPedido,
                                event.target.value
                              )
                            }
                          >
                            {STATUS.map((status) => (
                              <option
                                value={status}
                                key={status}
                              >
                                {status}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="btn btn-primary-gp btn-sm w-100"
                            disabled={
                              !alterado ||
                              salvandoId !== null
                            }
                            onClick={() =>
                              salvarStatus(pedido)
                            }
                          >
                            {salvando
                              ? "Salvando..."
                              : "Salvar status"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

    </section>
  );
}
