import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Cadastro from "../pages/Cadastro";
import Carrinho from "../pages/Carrinho";
import Checkout from "../pages/Checkout";
import Home from "../pages/Home";
import Produtos from "../pages/Produtos";
import Login from "../pages/Login";
import Pagamento from "../pages/Pagamento";
import Pedidos from "../pages/Pedidos";
import ProdutoDetalhes from "../pages/ProdutoDetalhes";
import CadastroProduto from "../pages/admin/CadastroProduto";
import Estoque from "../pages/admin/Estoque";
import PedidosAdmin from "../pages/admin/PedidosAdmin";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";
import EditarProduto from "../pages/admin/EditarProduto";

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

        {/* HOME */}
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

        {/* PRODUTOS - ACESSO PÚBLICO */}
        <Route
          path="/produtos"
          element={
            <Produtos
              products={products}
              categories={categories}
              loading={loading}
              error={error}
              user={user}
            />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <Login
              user={user}
              onLogin={onLogin}
            />
          }
        />

        {/* CADASTRO */}
        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        {/* DETALHES DO PRODUTO */}
        <Route
          path="/produto/:id"
          element={
            <PrivateRoute user={user}>
              <ProdutoDetalhes
                products={products}
                user={user}
                onAddToCart={cart.addItem}
              />
            </PrivateRoute>
          }
        />

        {/* CARRINHO */}
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

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <PrivateRoute user={user}>
              <Checkout cart={cart} />
            </PrivateRoute>
          }
        />

        {/* PAGAMENTO */}
        <Route
          path="/pagamento"
          element={
            <PrivateRoute user={user}>
              <Pagamento cart={cart} />
            </PrivateRoute>
          }
        />

        {/* PEDIDOS DO CLIENTE */}
        <Route
          path="/pedidos"
          element={
            <PrivateRoute user={user}>
              <Pedidos />
            </PrivateRoute>
          }
        />

        {/* ADMIN - CADASTRO DE PRODUTOS */}
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

        {/* ADMIN - EDITAR PRODUTO E DESCONTOS */}
        <Route
          path="/admin/produtos/editar/:id"
          element={
            <AdminRoute user={user}>
              <EditarProduto />
            </AdminRoute>
          }
        />

        {/* ADMIN - ESTOQUE */}
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

        {/* ADMIN - GERENCIAR PEDIDOS */}
        <Route
          path="/admin/pedidos"
          element={
            <AdminRoute user={user}>
              <PedidosAdmin />
            </AdminRoute>
          }
        />

        {/* ROTA NÃO ENCONTRADA */}
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Route>
    </Routes>
  );
}
