import { connection } from "../configs/Database.js";

const enderecoRepository = {

    // cria um novo endereço
    async criar(endereco) {

        const [resultado] = await connection.execute(
            `
            INSERT INTO endereco (
                CEP,
                rua,
                numero,
                complemento,
                idCliente
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                endereco.CEP,
                endereco.rua,
                endereco.numero,
                endereco.complemento,
                endereco.idCliente
            ]
        );

        return this.buscarPorId(
            resultado.insertId
        );
    },

    // lista os endereços de um cliente
    async listarPorCliente(idCliente) {

        const [rows] = await connection.execute(
            `
            SELECT
                idEndereco,
                CEP,
                rua,
                numero,
                complemento,
                idCliente
            FROM endereco
            WHERE idCliente = ?
            ORDER BY idEndereco DESC
            `,
            [idCliente]
        );

        return rows;
    },

    // busca um endereço pelo ID
    async buscarPorId(idEndereco) {

        const [rows] = await connection.execute(
            `
            SELECT
                idEndereco,
                CEP,
                rua,
                numero,
                complemento,
                idCliente
            FROM endereco
            WHERE idEndereco = ?
            LIMIT 1
            `,
            [idEndereco]
        );

        return rows[0] || null;
    },

    // atualiza um endereço
    async atualizar(idEndereco, endereco) {

        await connection.execute(
            `
            UPDATE endereco
            SET
                CEP = ?,
                rua = ?,
                numero = ?,
                complemento = ?
            WHERE idEndereco = ?
            `,
            [
                endereco.CEP,
                endereco.rua,
                endereco.numero,
                endereco.complemento,
                idEndereco
            ]
        );

        return this.buscarPorId(idEndereco);
    },

    // remove um endereço
    async remover(idEndereco) {

        const [resultado] =
            await connection.execute(
                `
                DELETE FROM endereco
                WHERE idEndereco = ?
                `,
                [idEndereco]
            );

        return resultado.affectedRows;
    }
};

export default enderecoRepository;
