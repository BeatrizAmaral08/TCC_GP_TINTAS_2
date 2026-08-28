import {
  LogIn,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  getApiError,
} from "../services/api";
import {
  login,
} from "../services/authService";

function isAdmin(user) {
  const profile =
    user?.perfil ||
    user?.tipo;

  return [
    "repositor",
    "dev",
  ].includes(profile);
}

export default function Login({
  user,
  onLogin,
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (isAdmin(user)) {
      navigate(
        "/admin/produtos",
        {
          replace: true,
        }
      );

      return;
    }

    navigate(
      "/",
      {
        replace: true,
      }
    );
  }, [
    user,
    navigate,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError(
      ""
    );

    setLoading(
      true
    );

    try {
      const response = await login(
        email,
        senha
      );

      onLogin(
        response.usuario
      );

      const requestedPage = location.state?.from;

      if (
        requestedPage &&
        isAdmin(response.usuario)
      ) {
        navigate(
          requestedPage,
          {
            replace: true,
          }
        );

        return;
      }

      if (isAdmin(response.usuario)) {
        navigate(
          "/admin/produtos",
          {
            replace: true,
          }
        );

        return;
      }

      navigate(
        "/",
        {
          replace: true,
        }
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Confira seu e-mail e sua senha."
        )
      );
    } finally {
      setLoading(
        false
      );
    }
  }

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
          Informe seu e-mail e sua senha para continuar.
        </p>

        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                setEmail(
                  event.target.value
                );
              }}
              required
            />
          </div>

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
                setSenha(
                  event.target.value
                );
              }}
              required
            />
          </div>

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

        <p className="auth-link">
          Ainda não tem uma conta?{" "}
          <Link to="/cadastro">
            Criar conta
          </Link>
        </p>
      </div>
    </section>
  );
}
