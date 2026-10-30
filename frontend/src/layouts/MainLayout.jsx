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
        <div className="container">

          <div className="footer-main">

            {/* Informações da loja */}
            <div className="footer-brand">
              <strong>GPTintas</strong>
              <span>
                Qualidade e cor para o seu projeto.
              </span>
            </div>

            {/* Instagram e e-mail */}
            <div className="footer-contact">

              <a
                href="https://www.instagram.com/gp_tintas/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>◎</span>
                @gp_tintas
              </a>

              <a href="mailto:gptintas@hotmail.com">
                <span>✉</span>
                gptintas@hotmail.com
              </a>

            </div>
          </div>
          <div className="footer-bottom">
            © 2026 GP Tintas. Todos os direitos reservados.
          </div>

        </div>
      </footer>
    </div>
  );
}
