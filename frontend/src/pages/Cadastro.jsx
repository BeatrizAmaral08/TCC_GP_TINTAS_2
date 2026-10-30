
import { UserPlus } from "lucide-react";
import { useState } from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import { getApiError } from "../services/api";
import { register } from "../services/authService";

const initialForm = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  senha: "",
  confirmarSenha: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

const estados = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
];

export default function Cadastro() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Produto escolhido antes do cadastro
  const requestedPage = location.state?.from;

  // Mantém apenas destinos internos válidos
  const validDestination =
    typeof requestedPage === "string" &&
    requestedPage.startsWith("/") &&
    !requestedPage.startsWith("//") &&
    !requestedPage.includes("\\") &&
    requestedPage !== "/login" &&
    requestedPage !== "/cadastro";

  const returnPage = validDestination
    ? requestedPage
    : null;

  // Requisitos de segurança da senha
  const requisitosSenha = [
    {
      texto: "Pelo menos 8 caracteres",
      valido: form.senha.length >= 8,
    },
    {
      texto: "Pelo menos uma letra maiúscula",
      valido: /[A-Z]/.test(form.senha),
    },
    {
      texto: "Pelo menos um caractere especial",
      valido: /[^A-Za-z0-9\s]/.test(form.senha),
    },
  ];

  const senhaValida = requisitosSenha.every(
    (requisito) => requisito.valido
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  // ========================================
  // REALIZAR CADASTRO
  // ========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!senhaValida) {
      setError(
        "Sua senha precisa cumprir todos os requisitos indicados."
      );
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);

    try {
      // Envia os dados ao backend
      await register({
        nome: form.nome,
        email: form.email,
        cpf: form.cpf,
        telefone: form.telefone,
        senha: form.senha,
        cep: form.cep,
        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
      });

      setMessage("Conta criada com sucesso.");
      setForm(initialForm);

      // Envia ao login preservando o produto
      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            from: returnPage,
          },
        });
      }, 900);

    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Não foi possível criar sua conta."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INTERFACE DE CADASTRO
  // ========================================

  return (
    <section className="container register-section">
      <div className="register-card">

        <span className="section-label">
          Cadastro
        </span>

        <h1>Crie sua conta</h1>

        <p>
          Preencha seus dados para acessar a GPTintas.
        </p>

        {message && (
          <div className="feedback feedback-success">
            {message}
          </div>
        )}

        {error && (
          <div className="feedback feedback-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <h2 className="form-section-title">
            Dados pessoais
          </h2>

          <div className="row g-3">

            {/* Nome */}
            <div className="col-md-6">
              <label className="form-label">
                Nome
              </label>

              <input
                name="nome"
                className="form-control"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </div>

            {/* E-mail */}
            <div className="col-md-6">
              <label className="form-label">
                E-mail
              </label>

              <input
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* CPF */}
            <div className="col-md-4">
              <label className="form-label">
                CPF
              </label>

              <input
                name="cpf"
                className="form-control"
                value={form.cpf}
                onChange={handleChange}
                required
              />
            </div>

            {/* Telefone */}
            <div className="col-md-4">
              <label className="form-label">
                Telefone
              </label>

              <input
                name="telefone"
                className="form-control"
                value={form.telefone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Estado */}
            <div className="col-md-4">
              <label className="form-label">
                Estado
              </label>

              <select
                name="estado"
                className="form-select"
                value={form.estado}
                onChange={handleChange}
                required
              >
                <option value="">
                  Selecione
                </option>

                {estados.map(([uf, nome]) => (
                  <option
                    key={uf}
                    value={uf}
                  >
                    {nome} ({uf})
                  </option>
                ))}
              </select>
            </div>

            {/* Senha */}
            <div className="col-md-6">
              <label className="form-label">
                Senha
              </label>

              <input
                name="senha"
                type="password"
                className="form-control"
                value={form.senha}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <div className="password-requirements mt-2">
                <small className="d-block mb-1">
                  Sua senha deve conter:
                </small>

                {requisitosSenha.map((requisito) => (
                  <div
                    key={requisito.texto}
                    className={
                      `password-requirement ${requisito.valido ? "valid" : ""
                      }`
                    }
                  >
                    <span aria-hidden="true">
                      {requisito.valido ? "✓" : "○"}
                    </span>

                    <small>
                      {requisito.texto}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmar senha */}
            <div className="col-md-6">
              <label className="form-label">
                Confirmar senha
              </label>

              <input
                name="confirmarSenha"
                type="password"
                className="form-control"
                value={form.confirmarSenha}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

          </div>

          <h2 className="form-section-title mt-4">
            Endereço
          </h2>

          <div className="row g-3">

            {/* CEP */}
            <div className="col-md-3">
              <label className="form-label">
                CEP
              </label>

              <input
                name="cep"
                className="form-control"
                value={form.cep}
                onChange={handleChange}
                required
              />
            </div>

            {/* Endereço */}
            <div className="col-md-6">
              <label className="form-label">
                Endereço
              </label>

              <input
                name="endereco"
                className="form-control"
                value={form.endereco}
                onChange={handleChange}
                required
              />
            </div>

            {/* Número */}
            <div className="col-md-3">
              <label className="form-label">
                Número
              </label>

              <input
                name="numero"
                className="form-control"
                value={form.numero}
                onChange={handleChange}
                required
              />
            </div>

            {/* Complemento */}
            <div className="col-md-4">
              <label className="form-label">
                Complemento
              </label>

              <input
                name="complemento"
                className="form-control"
                value={form.complemento}
                onChange={handleChange}
              />
            </div>

            {/* Bairro */}
            <div className="col-md-4">
              <label className="form-label">
                Bairro
              </label>

              <input
                name="bairro"
                className="form-control"
                value={form.bairro}
                onChange={handleChange}
                required
              />
            </div>

            {/* Cidade */}
            <div className="col-md-4">
              <label className="form-label">
                Cidade
              </label>

              <input
                name="cidade"
                className="form-control"
                value={form.cidade}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Criar conta */}
          <button
            type="submit"
            className="btn btn-primary-gp mt-4"
            disabled={loading || !senhaValida}
          >
            <UserPlus size={18} />

            {loading
              ? "Criando conta..."
              : "Criar conta"}
          </button>

          {/* Voltar ao login */}
          <Link
            className="btn btn-outline-gp mt-4 ms-2"
            to="/login"
            state={{
              from: returnPage,
            }}
          >
            Voltar para entrar
          </Link>

        </form>
      </div>
    </section>
  );
}
