import api from "./api";

const TOKEN_KEY = "gp-token";
const USER_KEY = "gp-auth";

export function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const perfil =
    user.perfil ||
    user.tipo ||
    "comprador";

  return {
    ...user,
    perfil,
    tipo: perfil,
  };
}

export function saveSession(
  token,
  user
) {
  const normalizedUser = normalizeUser(
    user
  );

  localStorage.setItem(
    TOKEN_KEY,
    token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(normalizedUser)
  );

  return normalizedUser;
}

export function clearSession() {
  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}

export function getStoredToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

export function getStoredUser() {
  try {
    const value = localStorage.getItem(
      USER_KEY
    );

    if (!value) {
      return null;
    }

    return normalizeUser(
      JSON.parse(value)
    );
  } catch {
    return null;
  }
}

export async function login(
  email,
  senha
) {
  const response = await api.post(
    "/auth/login",
    {
      email,
      senha,
    }
  );

  return {
    ...response.data,
    usuario: saveSession(
      response.data.token,
      response.data.usuario
    ),
  };
}

export async function register(payload) {
  const response = await api.post(
    "/auth/register",
    payload
  );

  return response.data;
}

export async function me() {
  const response = await api.get(
    "/auth/me"
  );

  const currentUser = normalizeUser(
    response.data.usuario
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(currentUser)
  );

  return currentUser;
}
