import { connection } from "../configs/Database.js";

const carrinhoRepository = {


    //cria um novo carrinho para o cliente
    async criar(idCliente) {

        const [resultado] = await connection.execute(
            `
            INSERT INTO carrinho (idCliente)
            VALUES (?)
            `,
            [idCliente]
        );

        return {
            idCarrinho: resultado.insertId,
            idCliente
        };
    },

    // busca o carrinho do cliente
    async buscarPorCliente(idCliente) {

        const [rows] = await connection.execute(
            `
            SELECT
                idCarrinho,
                idCliente
            FROM carrinho
            WHERE idCliente = ?
            LIMIT 1
            `,
            [idCliente]
        );

        return rows[0] || null;
    },


    // busca o carrinho ou cria um novo caso ele não exista
    async buscarOuCriar(idCliente) {

        let carrinho =
            await this.buscarPorCliente(idCliente);

        if (!carrinho) {
            carrinho =
                await this.criar(idCliente);
        }

        return carrinho;
    }
};

export default carrinhoRepository;
