import { connection } from "../configs/Database.js";

const carrinhoRepository = {

  //criar carrinho

  async criar(idCliente) {
    const [resultado] = await connection.execute(
      `INSERT INTO carrinho (idCliente)
       VALUES (?)`,
      [idCliente]
    );

    return {
      idCarrinho: resultado.insertId,
      idCliente,
    };
  },

 //buscar carrinho do cliente

  async buscarPorCliente(idCliente) {
    const [rows] = await connection.execute(
      `SELECT
        idCarrinho,
        idCliente
       FROM carrinho
       WHERE idCliente = ?
       LIMIT 1`,
      [idCliente]
    );

    return rows[0] || null;
  },

  //buscar ou criar carrinho

  async buscarOuCriar(idCliente) {
    const carrinho =
      await this.buscarPorCliente(idCliente);

    if (carrinho) {
      return carrinho;
    }

    try {
      return await this.criar(idCliente);
    } catch (error) {

      // Outra requisição pode ter criado
      // o carrinho no mesmo instante.
      if (error.code === "ER_DUP_ENTRY") {
        const existente =
          await this.buscarPorCliente(idCliente);

        if (existente) {
          return existente;
        }
      }

      throw error;
    }
  },
};

export default carrinhoRepository;
