import api from "./api";

export async function alterarEstoque(
  idProduto,
  operacao,
  quantidade,
  motivo
) {
  const response = await api.patch(
    `/estoque/${idProduto}`,
    {
      operacao,
      quantidade,
      motivo,
    }
  );

  return response.data;
}
