import api from "./api";

// Altera o estoque de um produto ou de uma volumetria
export async function alterarEstoque(
  idProduto,
  operacao,
  quantidade,
  motivo,
  idProdutoVolumetria = null
) {
  const response = await api.patch(
    `/estoque/${idProduto}`,
    {
      operacao,
      quantidade,
      motivo,
      idProdutoVolumetria,
    }
  );

  return response.data;
}
