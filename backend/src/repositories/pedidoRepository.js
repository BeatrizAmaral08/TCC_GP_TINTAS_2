import { connection } from "../configs/Database.js";

const pedidoRepository = {

    // cria um novo pedido
    async criar(pedido) {

        const [resultado] = await connection.execute(
            `
            INSERT INTO pedido (
                idCliente,
                data,
                statusEntrega,
                valorTotal,
                formaPagamento
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                pedido.idCliente,
                pedido.data,
                pedido.statusEntrega,
                pedido.valorTotal,
                pedido.formaPagamento
            ]
        );

        return this.buscarPorId(
            resultado.insertId
        );
    },

    // busca um pedido pelo ID
    async buscarPorId(idPedido) {

        const [rows] = await connection.execute(
            `
            SELECT
                idPedido,
                idCliente,
                data,
                statusEntrega,
                valorTotal,
                formaPagamento
            FROM pedido
            WHERE idPedido = ?
            LIMIT 1
            `,
            [idPedido]
        );

        return rows[0] || null;
    },

    // lista todos os pedidos de um cliente
    async listarPorCliente(idCliente) {

        const [rows] = await connection.execute(
            `
            SELECT
                idPedido,
                idCliente,
                data,
                statusEntrega,
                valorTotal,
                formaPagamento
            FROM pedido
            WHERE idCliente = ?
            ORDER BY idPedido DESC
            `,
            [idCliente]
        );

        return rows;
    },

    // edita um pedido
    async editar(idPedido, pedido) {

        await connection.execute(
            `
            UPDATE pedido
            SET
                data = ?,
                statusEntrega = ?,
                valorTotal = ?,
                formaPagamento = ?
            WHERE idPedido = ?
            `,
            [
                pedido.data,
                pedido.statusEntrega,
                pedido.valorTotal,
                pedido.formaPagamento,
                idPedido
            ]
        );

        return this.buscarPorId(idPedido);
    },

    // exclui um pedido
    async excluir(idPedido) {

        const [resultado] = await connection.execute(
            `
            DELETE FROM pedido
            WHERE idPedido = ?
            `,
            [idPedido]
        );

        return resultado.affectedRows > 0;
    }

};

export default pedidoRepository;