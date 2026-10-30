import enderecoRepository from "../repositories/enderecoRepository.js";
import { Endereco } from "../models/Endereco.js";


function validarId(valor) {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null;
  }

  const id = Number(valor);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

function tratarErro(error, res, mensagem) {
  console.error(mensagem, error);

  if (
    ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"]
      .includes(error.code)
  ) {
    return res.status(503).json({
      message: "Banco de dados indisponível.",
    });
  }

  if (
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return res.status(error.status).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: mensagem,
  });
}

const enderecoController = {

 //cadastro de endereço

  criar: async (req, res) => {
    try {
      const idCliente = req.user.id;

      const endereco = new Endereco({
        ...req.body,
        idCliente
      });

      const resultado =
        await enderecoRepository.criar(endereco);

      return res.status(201).json(resultado);

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao criar endereço."
      );
    }
  },

  //lista de endereços

  listar: async (req, res) => {
    try {
      const enderecos =
        await enderecoRepository.listarPorCliente(
          req.user.id
        );

      return res.status(200).json(enderecos);

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao listar endereços."
      );
    }
  },

  //busca endereço

  buscar: async (req, res) => {
    try {
      const idEndereco = validarId(req.params.id);

      if (!idEndereco) {
        return res.status(400).json({
          message: "ID do endereço inválido."
        });
      }

      const endereco =
        await enderecoRepository.buscarPorId(idEndereco);

      if (!endereco) {
        return res.status(404).json({
          message: "Endereço não encontrado."
        });
      }

      if (
        Number(endereco.idCliente) !==
        Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "Você não pode acessar este endereço."
        });
      }

      return res.status(200).json(endereco);

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao buscar endereço."
      );
    }
  },

  //atualiza um endereço

  atualizar: async (req, res) => {
    try {
      const idEndereco = validarId(req.params.id);

      if (!idEndereco) {
        return res.status(400).json({
          message: "ID do endereço inválido."
        });
      }

      const enderecoAtual =
        await enderecoRepository.buscarPorId(idEndereco);

      if (!enderecoAtual) {
        return res.status(404).json({
          message: "Endereço não encontrado."
        });
      }

      if (
        Number(enderecoAtual.idCliente) !==
        Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "Você não pode alterar este endereço."
        });
      }

      const endereco = new Endereco({
        ...req.body,
        idCliente: req.user.id
      });

      const resultado =
        await enderecoRepository.atualizar(
          idEndereco,
          endereco
        );

      if (!resultado) {
        return res.status(404).json({
          message: "Endereço não encontrado."
        });
      }

      return res.status(200).json(resultado);

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao atualizar endereço."
      );
    }
  },

  //remove o endereço

  remover: async (req, res) => {
    try {
      const idEndereco = validarId(req.params.id);

      if (!idEndereco) {
        return res.status(400).json({
          message: "ID do endereço inválido."
        });
      }

      const endereco =
        await enderecoRepository.buscarPorId(idEndereco);

      if (!endereco) {
        return res.status(404).json({
          message: "Endereço não encontrado."
        });
      }

      if (
        Number(endereco.idCliente) !==
        Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "Você não pode remover este endereço."
        });
      }

      const removido =
        await enderecoRepository.remover(idEndereco);

      if (!removido) {
        return res.status(404).json({
          message: "Endereço não encontrado."
        });
      }

      return res.status(200).json({
        message: "Endereço removido com sucesso."
      });

    } catch (error) {
      return tratarErro(
        error,
        res,
        "Erro ao remover endereço."
      );
    }
  }
};

export default enderecoController;
