import fallbackImage from "../assets/logo/gp-tintas-logo.svg";
import api, { SERVER_BASE_URL } from "./api";

// Monta o endereço da imagem
function getImageUrl(value) {
  if (!value) {
    return fallbackImage;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${SERVER_BASE_URL}${value}`;
  }

  return `${SERVER_BASE_URL}/uploads/${value}`;
}

// Organiza os dados do produto
export function normalizeProduct(product) {
  if (!product) {
    return product;
  }

  let imagens = product.imagens || [];

  // Converte as imagens recebidas do banco
  if (typeof imagens === "string") {
    try {
      imagens = JSON.parse(imagens);
    } catch {
      imagens = [];
    }
  }

  return {
    ...product,
    id: Number(product.id ?? product.idProduto),
    categoriaId: Number(
      product.categoriaId ?? product.idCategoria
    ),
    preco: Number(product.preco || 0),
    precoPromocional:
      product.precoPromocional == null
        ? null
        : Number(product.precoPromocional),
    estoque: Number(product.estoque || 0),
    imagem: getImageUrl(product.imagem),
    imagens: imagens.map(getImageUrl),
  };
}

// Busca os produtos
export async function getProducts() {
  const response = await api.get("/produtos");

  return response.data.map(normalizeProduct);
}

// Busca as categorias
export async function getCategories() {
  const response = await api.get("/categorias");

  return response.data.map((category) => ({
    ...category,
    id: Number(category.id ?? category.idCategoria),
  }));
}

// Prepara os dados e as fotos para enviar ao backend
function createProductFormData(payload) {
  const formData = new FormData();

  formData.append("idCategoria", payload.idCategoria);
  formData.append("nome", payload.nome);
  formData.append("descricao", payload.descricao || "");
  formData.append("marca", payload.marca || "");
  formData.append("preco", payload.preco);
  formData.append("estoque", payload.estoque);
  formData.append("estoqueMinimo", payload.estoqueMinimo);
  formData.append("unidade", payload.unidade);

  // Foto principal dos acessórios
  if (payload.imagemPrincipal) {
    formData.append("imagemPrincipal", payload.imagemPrincipal);
  }

  // Fotos das tintas
  const fotosTinta = [
    "imagemLata",
    "imagemCor",
    "imagemSala",
    "imagemQuarto",
    "imagemCozinha",
    "imagemQuintal",
  ];

  fotosTinta.forEach((nome) => {
    if (payload[nome]) {
      formData.append(nome, payload[nome]);
    }
  });

  return formData;
}

// Cadastra um produto
export async function createProduct(payload) {
  const response = await api.post(
    "/produtos",
    createProductFormData(payload)
  );

  return normalizeProduct(response.data);
}

// Busca um produto pelo ID
export async function getProductById(idProduto) {
  const response = await api.get(
    `/produtos/${idProduto}`
  );

  return normalizeProduct(response.data);
}

// Atualiza os dados e as imagens de um produto
export async function updateProduct(idProduto, dados) {
  const formData = new FormData();

  // Adiciona somente os campos informados
  const campos = [
    "idCategoria",
    "nome",
    "descricao",
    "marca",
    "preco",
    "estoqueMinimo",
    "unidade",
  ];

  campos.forEach((campo) => {
    if (
      dados[campo] !== undefined &&
      dados[campo] !== null
    ) {
      formData.append(campo, dados[campo]);
    }
  });

  // Adiciona novas imagens, quando selecionadas
  const imagens = [
    "imagemPrincipal",
    "imagemLata",
    "imagemCor",
    "imagemSala",
    "imagemQuarto",
    "imagemCozinha",
    "imagemQuintal",
  ];

  imagens.forEach((campo) => {
    if (dados[campo] instanceof File) {
      formData.append(campo, dados[campo]);
    }
  });

  // Envia a atualização ao backend
  const response = await api.put(
    `/produtos/${idProduto}`,
    formData
  );

  return normalizeProduct(response.data);
}