import { connection } from "../configs/Database.js";

const enderecoRepository = {

  //cria um enedreço

  async criar(endereco, db = connection) {
    const [resultado] = await db.execute(
      `INSERT INTO endereco (
        CEP,
        rua,
        numero,
        complemento,
        idCliente
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        endereco.CEP,
        endereco.rua,
        endereco.numero,
        endereco.complemento ?? null,
        endereco.idCliente
      ]
    );

    return this.buscarPorId(resultado.insertId, db);
  },

  //lista de endereços do cliente

  async listarPorCliente(idCliente, db = connection) {
    const [rows] = await db.execute(
      `SELECT
        idEndereco,
        CEP,
        rua,
        numero,
        complemento,
        idCliente
      FROM endereco
      WHERE idCliente = ?
      ORDER BY idEndereco DESC`,
      [idCliente]
    );

    return rows;
  },

  //busca do endereço por id

  async buscarPorId(idEndereco, db = connection) {
    const [rows] = await db.execute(
      `SELECT
        idEndereco,
        CEP,
        rua,
        numero,
        complemento,
        idCliente
      FROM endereco
      WHERE idEndereco = ?
      LIMIT 1`,
      [idEndereco]
    );

    return rows[0] || null;
  },

 //atualiza o endereço

  async atualizar(
    idEndereco,
    endereco,
    db = connection
  ) {
    const [resultado] = await db.execute(
      `UPDATE endereco
      SET
        CEP = ?,
        rua = ?,
        numero = ?,
        complemento = ?
      WHERE idEndereco = ?`,
      [
        endereco.CEP,
        endereco.rua,
        endereco.numero,
        endereco.complemento ?? null,
        idEndereco
      ]
    );

    if (resultado.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(idEndereco, db);
  },

  //remove o endereço

  async remover(idEndereco, db = connection) {
    const [resultado] = await db.execute(
      `DELETE FROM endereco
      WHERE idEndereco = ?`,
      [idEndereco]
    );

    return resultado.affectedRows > 0;
  }
};

export default enderecoRepository;
