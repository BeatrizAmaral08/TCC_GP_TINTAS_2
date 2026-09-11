import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  getCategories,
  getProducts,
} from "../services/productService";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(
      true
    );

    setError(
      ""
    );

    try {
      const productList = await getProducts();
      const categoryList = await getCategories();

      setProducts(
        productList
      );

      setCategories(
        categoryList
      );
    } catch (requestError) {
      console.error(
        "Erro ao carregar produtos:",
        requestError
      );

      setError(
        "Não foi possível carregar os produtos agora."
      );
    } finally {
      setLoading(
        false
      );
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    categories,
    loading,
    error,
    reloadProducts: loadProducts,
  };
}
