import api from "./api";

export async function realizarCheckout(
  idEndereco,
  formaPagamento
) {
  const response = await api.post(
    "/pedidos/checkout",
    {
      idEndereco,
      formaPagamento,
    }
  );

  return response.data;
}

export async function getPedidos() {
  const response = await api.get(
    "/pedidos"
  );

  return response.data;
}

export async function getStatusPedidos() {
  const response = await api.get(
    "/pedidos/status"
  );

  return response.data;
}

export async function getPedido(id) {
  const response = await api.get(
    `/pedidos/${id}`
  );

  return response.data;
}
