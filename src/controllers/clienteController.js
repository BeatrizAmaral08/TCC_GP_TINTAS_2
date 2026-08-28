import clienteRepository from "../repositories/clienteRepository.js";
import {
  somenteNumeros,
  validarCPFBasico,
  validarEmail
} from "../utils/validators.js";

const clienteController = {

  // Criar cliente
  criar: async (req, res) => {
    try {
      const data = {
        ...req.body
      };

      // Validar nome
      if (!data.nome || String(data.nome).trim() === "") {
        return res.status(400).json({
          message: "Nome é obrigatório"
        });
      }

      data.nome = String(data.nome).trim();

      // Validar e-mail
      if (!data.email || !validarEmail(data.email)) {
        return res.status(400).json({
          message: "E-mail inválido"
        });
      }

      data.email = String(data.email)
        .toLowerCase()
        .trim();

      // Validar CPF
      if (!data.cpf || !validarCPFBasico(data.cpf)) {
        return res.status(400).json({
          message: "CPF inválido"
        });
      }

      data.cpf = somenteNumeros(data.cpf);

      // Criar cliente
      const cliente = await clienteRepository.criar(data);

      return res.status(201).json(cliente);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao criar cliente",
        errorMessage: error.message
      });
    }
  },


  // Listar clientes
  listar: async (req, res) => {
    try {
      const clientes =
        await clienteRepository.selecionar();

      return res.status(200).json(clientes);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao listar clientes",
        errorMessage: error.message
      });
    }
  },


  // Buscar cliente por ID
  buscar: async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "ID inválido"
        });
      }

      const cliente =
        await clienteRepository.buscarPorId(id);

      if (!cliente) {
        return res.status(404).json({
          message: "Cliente não encontrado"
        });
      }

      return res.status(200).json(cliente);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao buscar cliente",
        errorMessage: error.message
      });
    }
  },


  // Atualizar cliente
  atualizar: async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "ID inválido"
        });
      }

      const data = {
        ...req.body
      };

      // Validar nome
      if (data.nome !== undefined) {
        if (String(data.nome).trim() === "") {
          return res.status(400).json({
            message: "Nome não pode ser vazio"
          });
        }

        data.nome = String(data.nome).trim();
      }

      // Validar e-mail
      if (data.email !== undefined) {
        if (!validarEmail(data.email)) {
          return res.status(400).json({
            message: "E-mail inválido"
          });
        }

        data.email = String(data.email)
          .toLowerCase()
          .trim();
      }

      // Validar CPF
      if (data.cpf !== undefined) {
        if (!validarCPFBasico(data.cpf)) {
          return res.status(400).json({
            message: "CPF inválido"
          });
        }

        data.cpf = somenteNumeros(data.cpf);
      }

      // Atualizar
      const result =
        await clienteRepository.atualizar(id, data);

      if (!result) {
        return res.status(404).json({
          message: "Cliente não encontrado"
        });
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao atualizar cliente",
        errorMessage: error.message
      });
    }
  },


  // Excluir cliente
  desativar: async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "ID inválido"
        });
      }

      const ok =
        await clienteRepository.deletar(id);

      if (!ok) {
        return res.status(404).json({
          message: "Cliente não encontrado"
        });
      }

      return res.status(200).json({
        message: "Cliente excluído com sucesso"
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Erro ao excluir cliente",
        errorMessage: error.message
      });
    }
  }
};

export default clienteController;