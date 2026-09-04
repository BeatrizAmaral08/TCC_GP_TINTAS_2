import { useEffect, useState, } from "react";
import { BrowserRouter, } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useProducts } from "./hooks/useProducts";
import AppRoutes from "./routes/AppRoutes";
import { clearSession, getStoredToken, getStoredUser, me, } from "./services/authService";

export default function App() {
  const [user, setUser] = useState(
    getStoredUser
  );

  const {
    products,
    categories,
    loading,
    error,
    reloadProducts,
  } = useProducts();

  useEffect(() => {
    async function validateSession() {
      if (!getStoredToken()) {
        return;
      }

      try {
        const currentUser = await me();

        setUser(
          currentUser
        );
      } catch {
        clearSession();
        setUser(
          null
        );
      }
    }

    validateSession();
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(
        null
      );
    }

    window.addEventListener(
      "gp:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "gp:unauthorized",
        handleUnauthorized
      );
    };
  }, []);

  function handleLogin(account) {
    setUser(
      account
    );
  }

  function handleLogout() {
    clearSession();

    setUser(
      null
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes
          user={user}
          products={products}
          categories={categories}
          loading={loading}
          error={error}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onProductCreated={reloadProducts}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}
