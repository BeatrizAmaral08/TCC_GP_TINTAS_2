import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogIn, LogOut, Moon, Sun, ShoppingCart, MessagesSquare, CircleUserRound, PackagePlus, ClipboardList, Boxes, MessageCircle, X } from "lucide-react";
import logo from "../assets/logo/gp-tintas-logo-nova.png";
import { ThemeContext } from "../contexts/ThemeContext";

// Verifica se o usuário possui acesso administrativo
function isAdmin(user) {
  const perfil = user?.perfil || user?.tipo;

  return ["repositor", "dev"].includes(perfil);
}

// Configura o atendimento pelo WhatsApp
const WHATSAPP_NUMERO = "5519992768459";

const WHATSAPP_MENSAGEM =
  "Olá! Vim pelo site da GP Tintas e gostaria de tirar uma dúvida sobre os produtos.";

const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MENSAGEM)}`;

export default function Header({
  user,
  onLogout,
  cartCount = 0,
}) {
  // Controle do tema claro e escuro
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Controla a janela de atendimento
  const [chatAberto, setChatAberto] = useState(false);

  // Define a classe dos links de navegação
  function navClass({ isActive }) {
    return isActive ? "nav-link active" : "nav-link";
  }

  // Abre ou fecha a janela de atendimento
  function toggleChat() {
    setChatAberto((atual) => !atual);
  }

  // Abre o WhatsApp com a mensagem preenchida
  function abrirWhatsApp() {
    window.open(
      WHATSAPP_URL,
      "_blank",
      "noopener,noreferrer"
    );

    setChatAberto(false);
  }

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-gpt">
        <div className="container">

          {/* Logo principal do GP Tintas */}
          <Link
            className="navbar-brand gp-logo-link"
            to="/"
            aria-label="GP Tintas - Página inicial"
          >
            <img
              src={logo}
              alt="GP Tintas"
              className="brand-logo"
            />
          </Link>

          {/* Menu responsivo */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#gpNavigation"
            aria-controls="gpNavigation"
            aria-expanded="false"
            aria-label="Abrir menu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse"
            id="gpNavigation"
          >
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              {/* HOME */}
              <NavLink className={navClass} to="/">
                Home
              </NavLink>

              {/* PRODUTOS */}
              <NavLink
                className={navClass}
                to="/produtos"
              >
                Produtos
              </NavLink>

              {/* USUÁRIO AUTENTICADO */}
              {user && (
                <>
                  {/* CARRINHO */}
                  <NavLink
                    className={navClass}
                    to="/carrinho"
                    title={`Carrinho (${cartCount})`}
                    aria-label={`Carrinho: ${cartCount} itens`}
                  >
                    <ShoppingCart size={21} />
                  </NavLink>

                  {/* ATENDIMENTO PELO WHATSAPP */}
                  <button
                    type="button"
                    className="nav-link border-0 bg-transparent d-flex align-items-center"
                    onClick={toggleChat}
                    title="Fale conosco"
                    aria-label="Abrir atendimento"
                    aria-expanded={chatAberto}
                    aria-controls="gp-chat-atendimento"
                  >
                    <MessagesSquare size={21} />
                  </button>

                  {/* MENU DE PERFIL */}
                  <details className="gp-profile">
                    <summary
                      className="nav-link"
                      title="Minha conta"
                      aria-label="Abrir opções da conta"
                    >
                      <CircleUserRound size={23} />
                    </summary>

                    <div className="gp-profile-menu">

                      {/* PEDIDOS DO CLIENTE */}
                      <Link to="/pedidos">
                        <ClipboardList size={17} />
                        Meus pedidos
                      </Link>

                      {/* OPÇÕES ADMINISTRATIVAS */}
                      {isAdmin(user) && (
                        <>
                          <Link to="/admin/produtos">
                            <PackagePlus size={17} />
                            Administrar produtos
                          </Link>

                          <Link to="/admin/estoque">
                            <Boxes size={17} />
                            Gerenciar estoque
                          </Link>

                          <Link to="/admin/pedidos">
                            <ClipboardList size={17} />
                            Gerenciar pedidos
                          </Link>
                        </>
                      )}

                      {/* SAIR */}
                      <button
                        type="button"
                        onClick={() => {
                          setChatAberto(false);
                          onLogout?.();
                        }}
                      >
                        <LogOut size={17} />
                        Sair
                      </button>

                    </div>
                  </details>
                </>
              )}

              {/* TEMA CLARO E ESCURO */}
              <button
                type="button"
                className="theme-button"
                onClick={toggleTheme}
                title="Alternar modo claro/escuro"
                aria-label="Alternar tema"
              >
                {theme === "light" ? (
                  <Moon size={19} />
                ) : (
                  <Sun size={19} />
                )}
              </button>

              {/* ENTRAR */}
              {!user && (
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

      {/* JANELA DE ATENDIMENTO */}
      {chatAberto && (
        <div
          id="gp-chat-atendimento"
          role="dialog"
          aria-modal="false"
          aria-labelledby="gp-chat-titulo"
          style={{
            position: "fixed",
            top: "85px",
            right: "16px",
            width: "calc(100% - 32px)",
            maxWidth: "370px",
            zIndex: 1100,
            backgroundColor:
              theme === "dark" ? "#242424" : "#ffffff",
            color:
              theme === "dark" ? "#ffffff" : "#222222",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            border:
              theme === "dark"
                ? "1px solid #444"
                : "1px solid #e9ecef",
          }}
        >
          {/* Cabeçalho da janela */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <MessageCircle
                size={23}
                color="#0066CC"
              />

              <strong>
                Atendimento GP Tintas
              </strong>
            </div>

            {/* Fechar atendimento */}
            <button
              type="button"
              className="btn p-1"
              onClick={() => setChatAberto(false)}
              aria-label="Fechar atendimento"
              style={{
                color: "inherit",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Mensagem para o cliente */}
          <h5
            id="gp-chat-titulo"
            className="fw-bold mb-2"
          >
            Tem alguma dúvida?
          </h5>

          <p className="mb-4">
            Entre em contato conosco! Nossa equipe
            está pronta para ajudar você a encontrar
            o produto ideal.
          </p>

          {/* Botão azul de redirecionamento */}
          <button
            type="button"
            onClick={abrirWhatsApp}
            className="d-flex align-items-center justify-content-center gap-2 w-100 border-0 fw-semibold"
            style={{
              backgroundColor: "#0066CC",
              color: "#ffffff",
              borderRadius: "999px",
              minHeight: "56px",
              padding: "12px 18px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <MessageCircle size={23} />

            Redirecionar ao WhatsApp
          </button>
        </div>
      )}
    </header>
  );
}
