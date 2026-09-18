import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  adicionarItemCarrinho,
  atualizarQuantidadeCarrinho,
  getCarrinho,
  removerItemCarrinho,
} from "../services/carrinhoService";

export function useCart(user) {
  const [cart, setCart] = useState({
    carrinho: null,
    itens: [],
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart({
        carrinho: null,
        itens: [],
        total: 0,
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getCarrinho();

      setCart(data);
    } catch (requestError) {
      console.error(
        "Erro ao carregar carrinho:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Não foi possível carregar o carrinho."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function addItem(
    idProdutoVolumetria,
    quantidade
  ) {
    setError("");

    try {
      await adicionarItemCarrinho(
        idProdutoVolumetria,
        quantidade
      );

      await loadCart();

      return {
        success: true,
      };
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Não foi possível adicionar o item.";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  }

  async function updateItem(
    idCarrinhoItem,
    quantidade
  ) {
    setError("");

    try {
      await atualizarQuantidadeCarrinho(
        idCarrinhoItem,
        quantidade
      );

      await loadCart();

      return {
        success: true,
      };
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Não foi possível atualizar a quantidade.";

      setError(message);

      return {
        success: false,
        message,
      };
    }
  }

  async function removeItem(idCarrinhoItem) {
    setError("");

    try {
      await removerItemCarrinho(
        idCarrinhoItem
      );

      await loadCart();

      return {
        success: true,
      };
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Não foi possível remover o item.";

      setError(message);

      return {
        success: false,
        message,
      };
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
