import { LogIn} from "lucide-react";
import { useEffect, useState,} from "react";
import { Link, useLocation, useNavigate} from "react-router-dom";

import {
  getApiError,
} from "../services/api";

import {
  login,
} from "../services/authService";

// Verifica se o usuário é administrador
function isAdmin(user) {
  const profile =
    user?.perfil ||
    user?.tipo;

  return [
    "repositor",
    "dev",
  ].includes(profile);
}

// Verifica se a página de destino é válida
function isValidDestination(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !path.startsWith("/login") &&
    !path.startsWith("/cadastro")
  );
}

// Define a página após o login
function getDestination(account, requestedPage) {
  const admin = isAdmin(account);

  if (isValidDestination(requestedPage)) {
    // Impede cliente comum de acessar
    // páginas administrativas
    const adminPage =
      requestedPage === "/admin" ||
      requestedPage.startsWith("/admin/");

    if (!adminPage || admin) {
      return requestedPage;
    }
  }

  // Destino padrão
  return admin ? "/admin/produtos" : "/";
}

export default function Login({
  user,
  onLogin,
}) {
  // Estados do formulário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Recupera a página solicitada antes do login
  const requestedPage = location.state?.from;

  // Redireciona caso o usuário já esteja logado
  useEffect(() => {
    if (!user) {
      return;
    }

    const destination = getDestination(
      user,
      requestedPage
    );

    navigate(destination, {
      replace: true,
    });
  }, [
    user,
    navigate,
    requestedPage,
  ]);

  // ========================================
  // REALIZAR LOGIN
  // ========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Autenticação no backend
      const response = await login(
        email,
        senha
      );

      // Atualiza usuário autenticado
      onLogin(response.usuario);

      // Recupera destino escolhido
      const destination = getDestination(
        response.usuario,
        requestedPage
      );

      // Redireciona ao produto ou
      // à página correspondente
      navigate(destination, {
        replace: true,
      });

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Confira seu e-mail e sua senha."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INTERFACE DO LOGIN
  // ========================================

  return (
    <section className="container auth-section">
      <div className="auth-card">

        <span className="section-label">
          Acesso
        </span>

        <h1>
          Entre na sua conta
        </h1>

        <p>
          Informe seu e-mail e sua senha
          para continuar.
        </p>

        {/* Mensagens de erro */}
        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>

          {/* E-mail */}
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="email"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              required
              autoComplete="email"
            />
          </div>

          {/* Senha */}
          <div className="form-group mt-3">
            <label
              className="form-label"
              htmlFor="senha"
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              className="form-control"
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value);
              }}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Botão de login */}
          <button
            type="submit"
            className="btn btn-primary-gp w-100 mt-4"
            disabled={loading}
          >
            <LogIn size={18} />

            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        {/* Criar conta */}
        <p className="auth-link">
          Ainda não tem uma conta?{" "}

          <Link
            to="/cadastro"
            state={{
              from: isValidDestination(requestedPage)
                ? requestedPage
                : null,
            }}
          >
            Criar conta
          </Link>
        </p>

      </div>
    </section>
  );
}
