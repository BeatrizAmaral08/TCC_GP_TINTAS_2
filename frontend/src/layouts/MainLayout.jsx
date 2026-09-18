import { Outlet, } from "react-router-dom";
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
        <div className="container">
          <strong>GPTintas</strong>
          <span>Qualidade e cor para o seu projeto.</span>
        </div>
      </footer>
    </div>
  );
}
