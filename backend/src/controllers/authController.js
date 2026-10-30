
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository.js";

// Configurações
const PERFIS = ["comprador", "repositor", "dev", "admin"];

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validarSenha(senha) {
  if (typeof senha !== "string") {
    return "Informe uma senha válida.";
  }

  if (senha.length < 8) {
    return "A senha deve conter pelo menos 8 caracteres.";
  }

  if (!/[A-Z]/.test(senha)) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }

  if (!/[^A-Za-z0-9\s]/.test(senha)) {
    return "A senha deve conter pelo menos um caractere especial.";
  }

  return null;
}

function dadosPublicos(usuario) {
  const perfil = usuario.perfil || "comprador";

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil,
    tipo: perfil,
  };
}

function tratarErro(error, res, mensagem) {
  console.error(mensagem, error);

  if (
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNRESET" ||
    error.code === "ECONNREFUSED"
  ) {
    return res.status(503).json({
      message: "Banco de dados indisponível. Tente novamente mais tarde.",
    });
  }

  return res.status(500).json({
    message: mensagem,
  });
}

// Controller de autenticação
const authController = {

  // Cadastro de cliente
  registrar: async (req, res) => {
    try {
      const { nome, email, senha, cpf } = req.body || {};

      const cpfLimpo =
        typeof cpf === "string"
          ? cpf.replace(/\D/g, "")
          : "";

      if (
        typeof nome !== "string" ||
        !nome.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof senha !== "string" ||
        !senha ||
        !cpfLimpo
      ) {
        return res.status(400).json({
          message: "Nome, e-mail, CPF e senha são obrigatórios.",
        });
      }

      const emailNormalizado = normalizarEmail(email);

      const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

      if (!emailValido) {
        return res.status(400).json({
          message: "Informe um e-mail válido.",
        });
      }

      // Validar quantidade de números do CPF
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({
          message: "Informe um CPF válido.",
        });
      }

      const erroSenha = validarSenha(senha);

      if (erroSenha) {
        return res.status(400).json({
          message: erroSenha,
        });
      }

      // Verificar e-mail já cadastrado
      const usuarioExistente =
        await authRepository.buscarPorEmail(emailNormalizado);

      if (usuarioExistente) {
        return res.status(409).json({
          message: "Este e-mail já está cadastrado.",
        });
      }

      // Criptografar senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar usuário como comprador
      const usuario = await authRepository.criar({
        nome: nome.trim(),
        email: emailNormalizado,
        senhaHash,
        cpf: cpfLimpo,
      });

      return res.status(201).json({
        message: "Cadastro realizado com sucesso.",
        usuario: dadosPublicos({
          ...usuario,
          perfil: "comprador",
        }),
      });

    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Este e-mail ou CPF já está cadastrado.",
        });
      }

      return tratarErro(
        error,
        res,
        "Erro ao realizar cadastro."
      );
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, senha } = req.body || {};

      if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof senha !== "string" ||
        !senha
      ) {
        return res.status(400).json({
          message: "E-mail e senha são obrigatórios.",
        });
      }

      const emailNormalizado = normalizarEmail(email);

      // Buscar usuário
      const usuario =
        await authRepository.buscarPorEmail(emailNormalizado);

      if (!usuario || !usuario.senha) {
        return res.status(401).json({
          message: "E-mail ou senha inválidos.",
        });
      }

      // Conferir senha
      const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
      );

      if (!senhaValida) {
        return res.status(401).json({
          message: "E-mail ou senha inválidos.",
        });
      }

      // Identificar perfil
      const perfil = String(
        usuario.perfil || ""
      ).trim().toLowerCase();

      if (!PERFIS.includes(perfil)) {
        return res.status(403).json({
          message: "Perfil de usuário não autorizado.",
        });
      }

      // Verificar JWT
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret || jwtSecret.length < 32) {
        console.error(
          "JWT_SECRET não configurado corretamente."
        );

        return res.status(503).json({
          message: "Autenticação temporariamente indisponível.",
        });
      }

      // Gerar token
      const token = jwt.sign(
        {
          id: usuario.id,
          perfil,
        },
        jwtSecret,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "8h",
        }
      );

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        token,
        usuario: dadosPublicos({
          ...usuario,
          perfil,
        }),
      });

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao realizar login."
      );
    }
  },

  // Usuário autenticado
  me: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      return res.status(200).json({
        usuario: req.user,
      });

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao buscar usuário."
      );
    }
  },
};

export default authController;
