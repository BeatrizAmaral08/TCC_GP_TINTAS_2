import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api"
).replace(
  /\/$/,
  ""
);

export const SERVER_BASE_URL = (
  import.meta.env.VITE_SERVER_URL ||
  API_BASE_URL.replace(
    /\/api$/,
    ""
  )
).replace(
  /\/$/,
  ""
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(
    "gp-token"
  );

  if (token) {
    config.headers = config.headers || {};

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const authorization = error.config?.headers?.Authorization;

    if (
      status === 401 &&
      authorization
    ) {
      localStorage.removeItem(
        "gp-token"
      );

      localStorage.removeItem(
        "gp-auth"
      );

      window.dispatchEvent(
        new Event("gp:unauthorized")
      );
    }

    return Promise.reject(
      error
    );
  }
);

export function getApiError(
  error,
  fallback = "Não foi possível concluir a operação."
) {
  return (
    error.response?.data?.message ||
    error.message ||
    fallback
  );
}

export default api;
