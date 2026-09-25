import fallbackImage from "../assets/logo/gp-tintas-logo.svg";
import api, {
  SERVER_BASE_URL,
} from "./api";

function getImageUrl(value) {
  if (!value) {
    return fallbackImage;
  }

  if (
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  if (
    String(value).startsWith("/")
  ) {
    return `${SERVER_BASE_URL}${value}`;
  }

  return `${SERVER_BASE_URL}/uploads/${value}`;
}

export function normalizeProduct(product) {
  if (!product) {
    return product;
  }

  return {
    ...product,
    id: Number(
      product.id ??
      product.idProduto
    ),
    categoriaId: Number(
      product.categoriaId ??
      product.idCategoria
    ),
    preco: Number(
      product.preco || 0
    ),
    precoPromocional:
      product.precoPromocional == null
        ? null
        : Number(product.precoPromocional),
    estoque: Number(
      product.estoque || 0
    ),
    imagem: getImageUrl(
      product.imagem
    ),
  };
}

export async function getProducts() {
  const response = await api.get(
    "/produtos"
  );

  return response.data.map(
    normalizeProduct
  );
}

export async function getCategories() {
  const response = await api.get(
    "/categorias"
  );

  return response.data.map((category) => {
    return {
      ...category,
      id: Number(
        category.id ??
        category.idCategoria
      ),
    };
  });
}

function createProductFormData(payload) {
  const formData = new FormData();

  formData.append(
    "idCategoria",
    payload.idCategoria
  );

  formData.append(
    "nome",
    payload.nome
  );

  formData.append(
    "descricao",
    payload.descricao
  );

  formData.append(
    "marca",
    payload.marca
  );

  formData.append(
    "preco",
    payload.preco
  );

  formData.append(
    "estoque",
    payload.estoque
  );

  formData.append(
    "estoqueMinimo",
    payload.estoqueMinimo
  );

  formData.append(
    "unidade",
    payload.unidade
  );

  if (
    payload.imagemArquivo instanceof File
  ) {
    formData.append(
      "imagemArquivo",
      payload.imagemArquivo
    );
  }

  return formData;
}

export async function createProduct(payload) {
  const response = await api.post(
    "/produtos",
    createProductFormData(payload)
  );

  return normalizeProduct(
    response.data
  );
}
