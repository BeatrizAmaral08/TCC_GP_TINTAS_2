import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository.js";
import { Cliente } from "../models/Cliente.js";
import { somenteNumeros, validarCEP } from "../utils/validators.js";

const authController = {

  //rregistro de usuario
  registrar: async (req, res) => {

    try {

      const {
        nome,
        email,
        cpf,
        senha,
        telefone,
        cep,
        rua,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      } = req.body;

      if (!nome || !email || !cpf || !senha) {

        return res.status(400).json({
          message: "Nome, email, CPF e senha são obrigatórios"
        });

      }

      if (String(senha).length < 6) {

        return res.status(400).json({
          message: "A senha deve possuir no mínimo 6 caracteres"
        });

      }

      const emailNormalizado =
        String(email).toLowerCase().trim();

      const usuarioExistente =
        await authRepository.buscarPorEmail(
          emailNormalizado
        );

      if (usuarioExistente) {

        return res.status(409).json({
          message: "E-mail já cadastrado"
        });

      }

      //validação do cep
      if (cep && !validarCEP(cep)) {

        return res.status(400).json({
          message: "CEP inválido"
        });

      }

      //criação do cliente
      const cliente = new Cliente({
        nome,
        email: emailNormalizado,
        cpf
      });

      //criação do endereço
      const enderecoObj = {

        cep: somenteNumeros(cep),
        rua: rua || endereco,
        numero: Number(numero),
        complemento,
        bairro,
        cidade,
        estado

      };

      //criptografia da senha
      const senhaHash =
        await bcrypt.hash(senha, 10);

      //criação no banco de dados
      const result =
        await authRepository.criar({

          cliente,
          senhaHash,
          telefone: somenteNumeros(telefone),
          endereco: enderecoObj
        });


      return res.status(201).json({

        message: "Cadastro realizado com sucesso",
        usuario: result

      });

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao realizar cadastro", errorMessage: error.message
      });

    }

  },

  //login
  login: async (req, res) => {

    try {

      const {
        email,
        senha
      } = req.body;

      
      //validação
      if (!email || !senha) {

        return res.status(400).json({
          message: "E-mail e senha são obrigatórios"

        });

      }

      const emailNormalizado =
        String(email).toLowerCase().trim();

      //buscar usuario
      const usuario =
        await authRepository.buscarPorEmail(
          emailNormalizado
        );

      if (
        !usuario ||
        !usuario.ativo ||
        !usuario.senha
      ) {

        return res.status(401).json({

          message: "E-mail ou senha inválidos"
        });

      }

        //validar senha
      const senhaValida =
        await bcrypt.compare(
          senha,
          usuario.senha
        );

      if (!senhaValida) {

        return res.status(401).json({

          message: "E-mail ou senha inválidos"

        });

      }

      //gerar token
      const token = jwt.sign(
        {
          id: usuario.id,
          perfil: usuario.perfil
        },

        process.env.JWT_SECRET ||
        "gptintas-dev-secret",

        {
          expiresIn:
            process.env.JWT_EXPIRES_IN ||
            "8h"
        }

      );

      return res.status(200).json({

        message: "Login realizado com sucesso",
        token,

        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          perfil: usuario.perfil
        }

      });

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao realizar login",
        errorMessage: error.message
      });

    }

  },

  //usuario logado
  me: async (req, res) => {

    try {

      return res.status(200).json({

        usuario: req.user

      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({

        message: "Erro ao buscar usuário"

      });
    }
  }
};


export default authController;