import { useCallback, useEffect, useRef, useState } from "react";
import { adicionarItemCarrinho, atualizarQuantidadeCarrinho, getCarrinho, removerItemCarrinho } from "../services/carrinhoService";
import { getApiError } from "../services/api";

const EMPTY_CART = {
  carrinho: null,
  itens: [],
  total: 0,
};

export function useCart(user) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Controla respostas antigas ao trocar de conta
  const requestId = useRef(0);
  const currentUserId = useRef(user?.id ?? null);

  currentUserId.current = user?.id ?? null;

  const loadCart = useCallback(async () => {
    const userId = user?.id ?? null;
    const currentRequest = ++requestId.current;

    if (!userId) {
      setCart(EMPTY_CART);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getCarrinho();

      // Ignora respostas de outra conta
      if (
        currentRequest !== requestId.current ||
        currentUserId.current !== userId
      ) {
        return;
      }

      setCart({
        carrinho: data?.carrinho ?? null,
        itens: Array.isArray(data?.itens) ? data.itens : [],
        total: Number(data?.total ?? 0),
      });
    } catch (requestError) {
      if (
        currentRequest !== requestId.current ||
        currentUserId.current !== userId
      ) {
        return;
      }

      setError(
        getApiError(
          requestError,
          "Não foi possível carregar o carrinho."
        )
      );
    } finally {
      if (
        currentRequest === requestId.current &&
        currentUserId.current === userId
      ) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadCart();

    return () => {
      requestId.current += 1;
    };
  }, [loadCart]);

  //adicionar volumetria

  async function addItem(idProdutoVolumetria, quantidade = 1) {
    const id = Number(idProdutoVolumetria);
    const qtd = Number(quantidade);

    if (!user) {
      return {
        success: false,
        message: "Faça login para adicionar produtos.",
      };
    }

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Volumetria inválida.",
      };
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
      return {
        success: false,
        message: "Informe uma quantidade válida.",
      };
    }

    setError("");

    try {
      await adicionarItemCarrinho(id, qtd);
      await loadCart();

      return { success: true };
    } catch (requestError) {
      const message = getApiError(
        requestError,
        "Não foi possível adicionar o item."
      );

      setError(message);

      return { success: false, message };
    }
  }


 //atualizar a quantidade

  async function updateItem(idCarrinhoItem, quantidade) {
    const id = Number(idCarrinhoItem);
    const qtd = Number(quantidade);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(qtd) ||
      qtd <= 0
    ) {
      return {
        success: false,
        message: "Item ou quantidade inválida.",
      };
    }

    setError("");

    try {
      await atualizarQuantidadeCarrinho(id, qtd);
      await loadCart();

      return { success: true };
    } catch (requestError) {
      const message = getApiError(
        requestError,
        "Não foi possível atualizar a quantidade."
      );

      setError(message);

      return { success: false, message };
    }
  }

  //remover item

  async function removeItem(idCarrinhoItem) {
    const id = Number(idCarrinhoItem);

    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        message: "Item do carrinho inválido.",
      };
    }

    setError("");

    try {
      await removerItemCarrinho(id);
      await loadCart();

      return { success: true };
    } catch (requestError) {
      const message = getApiError(
        requestError,
        "Não foi possível remover o item."
      );

      setError(message);

      return { success: false, message };
    }
  }

  return {
    ...cart,
    loading,
    error,
    loadCart,
    addItem,
    updateItem,
    removeItem,
  };
}
