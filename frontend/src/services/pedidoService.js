import api from "./api";

export async function realizarCheckout(
  idEndereco,
  formaPagamento
) {
  const response = await api.post(
    "/pedidos/checkout",
    {
      idEndereco,
      formaPagamento
    }
  );

  return response.data;
}

//lista os pedidos do clientes

export async function getPedidos() {
  const response = await api.get("/pedidos");

  return response.data;
}

//acompanha status do pedido

export async function getStatusPedidos() {
  const response = await api.get("/pedidos/status");

  return response.data;
}

//busca pedido pelo id

export async function getPedido(id) {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() === "" ||
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    throw new Error("ID do pedido inválido.");
  }

  const response = await api.get(
    `/pedidos/${Number(id)}`
  );

  return response.data;
}
