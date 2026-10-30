import api from "./api";

// Valida o identificador do produto ou da volumetria
function validarId(valor) {
  const id = Number(valor);

  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === "" ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    throw new Error("Identificador inválido.");
  }

  return id;
}

// Valida a porcentagem de desconto
function validarDesconto(valor) {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    throw new Error("Informe a porcentagem de desconto.");
  }

  const desconto = Number(valor);

  if (
    !Number.isFinite(desconto) ||
    desconto < 0 ||
    desconto > 100 ||
    Math.abs(desconto * 100 - Math.round(desconto * 100)) > 0.000001
  ) {
    throw new Error(
      "O desconto deve estar entre 0% e 100%, com até duas casas decimais."
    );
  }

  return desconto;
}

//lista as volumetrias de um produto
//administradores podem incluir as inativas
export async function getVolumetrias(
  idProduto,
  incluirInativas = false
) {
  const id = validarId(idProduto);

  const response = await api.get(
    `/volumetrias/produto/${id}`,
    {
      params: { incluirInativas },
    }
  );

  if (!Array.isArray(response.data)) {
    throw new Error(
      "Resposta inválida ao carregar volumetrias."
    );
  }

  return response.data;
}

// Busca uma volumetria pelo ID
export async function getVolumetria(idVolumetria) {
  const id = validarId(idVolumetria);

  const response = await api.get(
    `/volumetrias/${id}`
  );

  return response.data;
}

// Cadastra uma volumetria
export async function createVolumetria(
  idProduto,
  dados
) {
  const id = validarId(idProduto);

  if (!dados || typeof dados !== "object") {
    throw new Error("Dados da volumetria inválidos.");
  }

  const response = await api.post(
    `/volumetrias/produto/${id}`,
    dados
  );

  return response.data;
}

// Salva ou altera o desconto de uma volumetria
export async function salvarDesconto(
  idProduto,
  idVolumetria,
  porcentagem
) {
  const produtoId = validarId(idProduto);
  const volumeId = validarId(idVolumetria);
  const desconto = validarDesconto(porcentagem);

  const response = await api.put(
    `/volumetrias/produto/${produtoId}/${volumeId}/desconto`,
    {
      desconto,
    }
  );

  return response.data;
}

// eemove o desconto de uma volumetriae o preço original é preservado no banco
export async function removerDesconto(
  idProduto,
  idVolumetria
) {
  const produtoId = validarId(idProduto);
  const volumeId = validarId(idVolumetria);

  const response = await api.delete(
    `/volumetrias/produto/${produtoId}/${volumeId}/desconto`
  );

  return response.data;
}
