//import clienteRepository from "../repositories/clienteRepository.js";
import { somenteNumeros, validarCPFBasico, validarEmail, normalizarPerfil } from "../utils/validators.js";

const clienteController = {

  // criar cliente
criar: async (req, res) => {

  try {

    const data = {
      ...req.body
    };

    // validar nome
    if (!data.nome) {
      return res.status(400).json({
        message: "Nome é obrigatório"
      });
    }

    // validar email
    if (!data.email || !validarEmail(data.email)) {
      return res.status(400).json({
        message: "E-mail inválido"
      });
    }

    data.email = String(data.email)
      .toLowerCase()
      .trim();

    // validar CPF
    if (!data.cpf || !validarCPFBasico(data.cpf)) {
      return res.status(400).json({
        message: "CPF inválido"
      });
    }

    data.cpf = somenteNumeros(data.cpf);

    // normalizar telefone
    if (data.telefone !== undefined) {
      data.telefone = somenteNumeros(data.telefone);
    }

    // normalizar CEP
    if (data.cep !== undefined) {
      data.cep = somenteNumeros(data.cep);
    }

    // criar cliente
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

  //listar clientes
  listar: async (req, res) => {

    try {

      const {
        perfil
      } = req.query;

      const incluirInativos =
        req.query.incluirInativos === "true";

      const clientes =
        await clienteRepository.selecionar({

          perfil,

          incluirInativos
        });

      return res.status(200).json(clientes);
    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao listar clientes",
        errorMessage: error.message
      });
    }
  },

  //buscar cliente por id
  buscar: async (req, res) => {

    try {

      const id =
        Number(req.params.id);

      //verificar permissão
      if (
        req.user.perfil !== "dev" &&
        req.user.id !== id
      ) {

        return res.status(403).json({

          message: "Acesso negado"
        });
      }

      const cliente =
        await clienteRepository.buscarPorId(id);

      if (!cliente) {

        return res.status(404).json({

          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json(cliente);

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao buscar usuário",
        errorMessage: error.message
      });
    }
  },

  //atualizar cliente
  atualizar: async (req, res) => {

    try {

      const id =
        Number(req.params.id);

      //verificar permissão
      if (
        req.user.perfil !== "dev" &&
        req.user.id !== id
      ) {

        return res.status(403).json({

          message: "Acesso negado"
        });
      }

      const data = {
        ...req.body
      };

      //validar email
      if (data.email !== undefined) {

        if (!validarEmail(data.email)) {

          return res.status(400).json({

            message: "E-mail inválido"
          });
        }

        data.email =
          String(data.email)
            .toLowerCase()
            .trim();
      }

      //validar cpf
      if (data.cpf !== undefined) {

        if (!validarCPFBasico(data.cpf)) {

          return res.status(400).json({

            message: "CPF inválido"
          });
        }

        data.cpf =
          somenteNumeros(data.cpf);
      }

      //normalizar telefone
      if (data.telefone !== undefined) {

        data.telefone =
          somenteNumeros(data.telefone);
      }

      //normalizar cep
      if (data.cep !== undefined) {

        data.cep =
          somenteNumeros(data.cep);
      }

      const result =
        await clienteRepository.atualizar(

          id,
          data
        );

      if (!result) {

        return res.status(404).json({

          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json(result);

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao atualizar usuário",
        errorMessage: error.message
      });
    }
  },

  //desativar cliente
  desativar: async (req, res) => {

    try {

      const id =
        Number(req.params.id);

      //verificar próprio usuário
      if (id === req.user.id) {

        return res.status(400).json({
          message:
            "Você não pode desativar seu próprio usuário por esta rota"
        });
      }

      const ok =
        await clienteRepository.deletar(id);

      if (!ok) {

        return res.status(404).json({

          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json({

        message: "Usuário desativado"
      });

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao desativar usuário",
        errorMessage: error.message
      });
    }
  },

  //alterar perfil
  alterarPerfil: async (req, res) => {

    try {

      const id =
        Number(req.params.id);

      const perfil =
        normalizarPerfil(req.body.perfil);

      //verificar próprio perfil
      if (
        id === req.user.id &&
        perfil !== "dev"
      ) {

        return res.status(400).json({

          message:
            "Você não pode remover seu próprio perfil dev"
        });
      }

      const ok =
        await clienteRepository.alterarPerfil(

          id,
          perfil
        );

      if (!ok) {

        return res.status(404).json({

          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json({

        message: "Perfil atualizado",
        id,

        perfil
      });

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao alterar perfil",
        errorMessage: error.message
      });
    }
  },

  //alterar status
  alterarStatus: async (req, res) => {
    try {

      const id =
        Number(req.params.id);

      const ativo =
        Boolean(req.body.ativo);

      //verificar próprio usuário
      if (
        id === req.user.id &&
        !ativo
      ) {

        return res.status(400).json({
          message:
            "Você não pode desativar seu próprio usuário"
        });
      }

      const ok =
        await clienteRepository.alterarStatus(
          id,
          ativo
        );

      if (!ok) {

        return res.status(404).json({

          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json({

        message: "Status atualizado",
        id,
        ativo
      });

    } catch (error) {

      console.error(error);
      return res.status(500).json({

        message: "Erro ao alterar status",
        errorMessage: error.message
      });
    }
  }
};


export default clienteController;