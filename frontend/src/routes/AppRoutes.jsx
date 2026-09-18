import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Cadastro from "../pages/Cadastro";
import Carrinho from "../pages/Carrinho";
import Checkout from "../pages/Checkout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Pagamento from "../pages/Pagamento";
import Pedidos from "../pages/Pedidos";
import ProdutoDetalhes from "../pages/ProdutoDetalhes";
import CadastroProduto from "../pages/admin/CadastroProduto";
import Estoque from "../pages/admin/Estoque";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes({
  user,
  products,
  categories,
  loading,
  error,
  onLogin,
  onLogout,
  onProductCreated,
  cart,
}) {
  return (
    <Routes>
      <Route
        element={
          <MainLayout
            user={user}
            onLogout={onLogout}
            cartCount={cart?.itens?.length || 0}
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
          element={<Cadastro />}
        />

        <Route
          path="/produto/:id"
          element={
            <ProdutoDetalhes
              products={products}
              user={user}
              onAddToCart={cart.addItem}
            />
          }
        />

        <Route
          path="/carrinho"
          element={
            <PrivateRoute user={user}>
              <Carrinho
                cart={cart}
                updateItem={cart.updateItem}
                removeItem={cart.removeItem}
              />
            </PrivateRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <PrivateRoute user={user}>
              <Checkout cart={cart} />
            </PrivateRoute>
          }
        />

        <Route
          path="/pagamento"
          element={
            <PrivateRoute user={user}>
              <Pagamento cart={cart} />
            </PrivateRoute>
          }
        />

        <Route
          path="/pedidos"
          element={
            <PrivateRoute user={user}>
              <Pedidos />
            </PrivateRoute>
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
          path="/admin/estoque"
          element={
            <AdminRoute user={user}>
              <Estoque
                products={products}
                onStockChanged={onProductCreated}
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
