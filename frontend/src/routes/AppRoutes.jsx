import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Cadastro from "../pages/Cadastro";
import Home from "../pages/Home";
import Login from "../pages/Login";
import CadastroProduto from "../pages/admin/CadastroProduto";
import AdminRoute from "./AdminRoute";

export default function AppRoutes({
  user,
  products,
  categories,
  loading,
  error,
  onLogin,
  onLogout,
  onProductCreated,
}) {
  return (
    <Routes>
      <Route
        element={
          <MainLayout
            user={user}
            onLogout={onLogout}
          />
        }
      >
        <Route
          path="/"
          element={
            <Home
              products={products}
              categories={categories}
              loading={loading}
              error={error}
            />
          }
        />

        <Route
          path="/login"
          element={
            <Login
              user={user}
              onLogin={onLogin}
            />
          }
        />

        <Route
          path="/cadastro"
          element={
            <Cadastro />
          }
        />

        <Route
          path="/admin/produtos"
          element={
            <AdminRoute user={user}>
              <CadastroProduto
                categories={categories}
                onProductCreated={onProductCreated}
              />
            </AdminRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
}
