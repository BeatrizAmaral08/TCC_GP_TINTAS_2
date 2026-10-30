import { connection } from "../configs/Database.js";

const pedidoRepository = {

  async criar(pedido, db = connection) {
    const [resultado] = await db.execute(
      `INSERT INTO pedido (
        idCliente,
        data,
        statusEntrega,
        valorTotal,
        formaPagamento
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        pedido.idCliente,
        pedido.data,
        pedido.statusEntrega,
        pedido.valorTotal,
        pedido.formaPagamento,
      ]
    );

    return this.buscarPorId(resultado.insertId, db);
  },

  //busca um pedido pelo id

  async buscarPorId(idPedido, db = connection) {
    const [rows] = await db.execute(
      `SELECT
        idPedido,
        idCliente,
        data,
        statusEntrega,
        valorTotal,
        formaPagamento
      FROM pedido
      WHERE idPedido = ?
      LIMIT 1`,
      [idPedido]
    );

    return rows[0] || null;
  },

  //lista pedidos do cliente

  async listarPorCliente(idCliente, db = connection) {
    const [rows] = await db.execute(
      `SELECT
        idPedido,
        idCliente,
        data,
        statusEntrega,
        valorTotal,
        formaPagamento
      FROM pedido
      WHERE idCliente = ?
      ORDER BY idPedido DESC`,
      [idCliente]
    );

    return rows;
  },

  //acompanha status do pedido

  async acompanharStatus(idCliente, db = connection) {
    const [rows] = await db.execute(
      `SELECT
        idPedido,
        data,
        statusEntrega
      FROM pedido
      WHERE idCliente = ?
      ORDER BY idPedido DESC`,
      [idCliente]
    );

    return rows;
  },

 //listar todos os pedidos

  async listarTodos(db = connection) {
    const [rows] = await db.execute(
      `SELECT
        idPedido,
        idCliente,
        data,
        statusEntrega,
        valorTotal,
        formaPagamento
      FROM pedido
      ORDER BY idPedido DESC`
    );

    return rows;
  },

  //alterar status do pedido

  async alterarStatus(
    idPedido,
    statusEntrega,
    db = connection
  ) {
    const [resultado] = await db.execute(
      `UPDATE pedido
      SET statusEntrega = ?
      WHERE idPedido = ?`,
      [statusEntrega, idPedido]
    );

    if (resultado.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(idPedido, db);
  },

  //edição do pedido

  async editar(idPedido, pedido, db = connection) {
    const [resultado] = await db.execute(
      `UPDATE pedido
      SET
        data = ?,
        statusEntrega = ?,
        valorTotal = ?,
        formaPagamento = ?
      WHERE idPedido = ?`,
      [
        pedido.data,
        pedido.statusEntrega,
        pedido.valorTotal,
        pedido.formaPagamento,
        idPedido,
      ]
    );

    if (resultado.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(idPedido, db);
  },

  //escluir pedido

  async excluir(idPedido, db = connection) {
    const [resultado] = await db.execute(
      `DELETE FROM pedido
      WHERE idPedido = ?`,
      [idPedido]
    );

    return resultado.affectedRows > 0;
  },
};

export default pedidoRepository;
