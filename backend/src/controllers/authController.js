import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import authRepository from "../repositories/authRepository.js";

const authController = {
  // registrar usuário
  registrar: async (req, res) => {
    try {
      const {
        nome,
        email,
        senha,
      } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          message: "Nome, email e senha são obrigatórios",
        });
      }

      if (String(senha).length < 6) {
        return res.status(400).json({
          message: "A senha deve conter pelo menos 6 caracteres",
        });
      }

      const emailNormalizado = String(email)
        .toLowerCase()
        .trim();

      const usuarioExistente =
        await authRepository.buscarPorEmail(
          emailNormalizado
        );

      if (usuarioExistente) {
        return res.status(409).json({
          message: "E-mail já cadastrado",
        });
      }

      const senhaHash = await bcrypt.hash(
        senha,
        10
      );

      const usuario = await authRepository.criar({
        nome: String(nome).trim(),
        email: emailNormalizado,
        senhaHash,
      });

      return res.status(201).json({
        message: "Cadastro realizado com sucesso",
        usuario,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao realizar cadastro",
        errorMessage: error.message,
      });
    }
  },

  // login
  login: async (req, res) => {
    try {
      const {
        email,
        senha,
      } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          message: "E-mail e senha são obrigatórios",
        });
      }

      const emailNormalizado = String(email)
        .toLowerCase()
        .trim();

      const usuario =
        await authRepository.buscarPorEmail(
          emailNormalizado
        );

      if (!usuario || !usuario.senha) {
        return res.status(401).json({
          message: "E-mail ou senha inválidos",
        });
      }

      const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
      );

      if (!senhaValida) {
        return res.status(401).json({
          message: "E-mail ou senha inválidos",
        });
      }

      const token = jwt.sign(
        {
          id: usuario.id,
        },
        process.env.JWT_SECRET ||
          "gptintas-dev-secret",
        {
          expiresIn:
            process.env.JWT_EXPIRES_IN ||
            "8h",
        }
      );

      return res.status(200).json({
        message: "Login realizado com sucesso",
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        },
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao realizar login",
        errorMessage: error.message,
      });
    }
  },

  // usuário logado
  me: async (req, res) => {
    try {
      return res.status(200).json({
        usuario: req.user,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao buscar usuário",
        errorMessage: error.message,
      });
    }
  },
};

export default authController;
