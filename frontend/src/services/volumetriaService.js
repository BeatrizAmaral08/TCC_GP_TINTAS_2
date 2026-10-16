import api from "./api";

export async function getVolumetrias(idProduto) {
  const response = await api.get(
    `/volumetrias/produto/${idProduto}`
  );

  return response.data;
}

export async function getVolumetria(id) {
  const response = await api.get(
    `/volumetrias/${id}`
  );

  return response.data;
}

export async function createVolumetria(
  idProduto,
  dados
) {
  const response = await api.post(
    `/volumetrias/produto/${idProduto}`,
    dados
  );

  return response.data;
}
