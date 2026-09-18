import api from "./api";

export async function getCarrinho() {
  const response = await api.get(
    "/carrinho"
  );

  return response.data;
}

export async function adicionarItemCarrinho(
  idProdutoVolumetria,
  quantidade
) {
  const response = await api.post(
    "/carrinho/itens",
    {
      idProdutoVolumetria,
      quantidade,
    }
  );

  return response.data;
}

export async function atualizarQuantidadeCarrinho(
  idCarrinhoItem,
  quantidade
) {
  const response = await api.put(
    `/carrinho/itens/${idCarrinhoItem}`,
    {
      quantidade,
    }
  );

  return response.data;
}

export async function removerItemCarrinho(
  idCarrinhoItem
) {
  const response = await api.delete(
    `/carrinho/itens/${idCarrinhoItem}`
  );

  return response.data;
}
