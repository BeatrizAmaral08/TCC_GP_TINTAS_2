import {
  LogIn,
  LogOut,
  Moon,
  PackagePlus,
  Sun,
} from "lucide-react";
import {
  useContext,
} from "react";
import {
  Link,
  NavLink,
} from "react-router-dom";
import logo from "../assets/logo/gp-tintas-logo.svg";
import {
  ThemeContext,
} from "../contexts/ThemeContext";

function isAdmin(user) {
  const profile =
    user?.perfil ||
    user?.tipo;

  return [
    "repositor",
    "dev",
  ].includes(profile);
}

export default function Header({
  user,
  onLogout,
}) {
  const {
    theme,
    toggleTheme,
  } = useContext(
    ThemeContext
  );

  function navClass({ isActive }) {
    if (isActive) {
      return "nav-link active";
    }

    return "nav-link";
  }

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-gpt">
        <div className="container">
          <Link
            className="navbar-brand"
            to="/"
          >
            <img
              src={logo}
              alt="GPTintas"
              className="brand-logo"
            />

            <span>
              GPTintas
            </span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#gpNavigation"
            aria-controls="gpNavigation"
            aria-expanded="false"
            aria-label="Abrir navegação"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse"
            id="gpNavigation"
          >
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
              <NavLink
                className={navClass}
                to="/"
              >
                Produtos
              </NavLink>

              {isAdmin(user) && (
                <NavLink
                  className={navClass}
                  to="/admin/produtos"
                >
                  <PackagePlus size={17} />
                  Cadastrar produto
                </NavLink>
              )}

              <button
                type="button"
                className="theme-button"
                onClick={toggleTheme}
                aria-label="Alternar tema"
              >
                {theme === "light" ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )}
              </button>

              {user ? (
                <button
                  type="button"
                  className="btn btn-outline-gp"
                  onClick={onLogout}
                >
                  <LogOut size={17} />
                  Sair
                </button>
              ) : (
                <Link
                  className="btn btn-outline-gp"
                  to="/login"
                >
                  <LogIn size={17} />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
