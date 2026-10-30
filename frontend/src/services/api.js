import axios from "axios";

//configuração da API

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api"
).replace(/\/$/, "");

export const SERVER_BASE_URL = (
  import.meta.env.VITE_SERVER_URL ||
  API_BASE_URL.replace(/\/api$/, "")
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

//envio de token nas requisições

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gp-token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//tratamento de respostas e erros

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const authorization =
      error.config?.headers?.Authorization;

    const mensagem = String(
      error.response?.data?.message || ""
    ).toLowerCase();

    // Encerra a sessão quando o token
    // estiver inválido ou expirado
    const tokenInvalido =
      mensagem.includes("token inválido") ||
      mensagem.includes("token expirado") ||
      mensagem.includes("usuário não encontrado") ||
      mensagem.includes("usuário inválido");

    if (
      status === 401 &&
      authorization &&
      tokenInvalido
    ) {
      localStorage.removeItem("gp-token");
      localStorage.removeItem("gp-auth");

      window.dispatchEvent(
        new Event("gp:unauthorized")
      );
    }

    return Promise.reject(error);
  }
);


//avisos de erro

export function getApiError(
  error,
  fallback = "Não foi possível concluir a operação."
) {
  // Erro retornado pelo backend
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Tempo limite de conexão
  if (error.code === "ECONNABORTED") {
    return "O servidor demorou para responder. Tente novamente.";
  }

  // Problema de rede
  if (error.code === "ERR_NETWORK") {
    return "Não foi possível conectar ao servidor.";
  }

  // Erro de validação local
  if (!error.isAxiosError && error.message) {
    return error.message;
  }

  return fallback;
}

export default api;
