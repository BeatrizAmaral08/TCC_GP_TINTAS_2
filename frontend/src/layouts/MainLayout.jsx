import { Outlet, NavLink } from "react-router-dom";
import Header from "../components/Header";

export default function MainLayout({
  user,
  onLogout,
  cartCount = 0,
}) {
  return (
    <div className="app-shell">
      <Header
        user={user}
        onLogout={onLogout}
        cartCount={cartCount}
      />

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <strong>GPTintas</strong>
            <span>Qualidade e cor para o seu projeto.</span>
          </div>
          <nav className="footer-navigation" aria-label="Navegação principal">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/produtos">Produtos</NavLink>
            <a href="/#quem-somos">Quem somos</a>
            <a href="/#simular-cor">Simular cor</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
