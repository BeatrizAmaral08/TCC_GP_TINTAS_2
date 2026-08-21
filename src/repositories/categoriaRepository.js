import { connection } from '../configs/Database.js';

const categoriaRepository = {

    async listar(incluirInativas = false) {
        const [rows] = await connection.execute(
            `SELECT idCategoria AS id, nome, descricao, ativo, dataCad FROM categoria
             ${incluirInativas ? '' : 'WHERE ativo = 1'} ORDER BY nome`
        );

        return rows;
    },

    async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT idCategoria AS id, nome, descricao, ativo, dataCad FROM categoria
             WHERE idCategoria=?`,
            [id]
        );

        return rows[0] || null;
    },

    async criar({ nome, descricao }) {
        const [r] = await connection.execute(
            `INSERT INTO categoria (nome, descricao, ativo)
             VALUES (?,?,1)`,
            [nome, descricao || null]
        );

        return this.buscarPorId(r.insertId);
    },

    async atualizar(id, { nome, descricao, ativo }) {
        const dados = {
            nome,
            descricao: descricao || null,
            ativo: ativo !== undefined ? (ativo ? 1 : 0) : undefined
        };

        const campos = Object.entries(dados)
            .filter(([_, valor]) => valor !== undefined);

        if (!campos.length) return this.buscarPorId(id);

        const fields = campos.map(([campo]) => `${campo}=?`);
        const values = campos.map(([_, valor]) => valor);

        values.push(id);

        await connection.execute(
            `UPDATE categoria SET ${fields.join(', ')} WHERE idCategoria=?`,
            values
        );

        return this.buscarPorId(id);
    },

    async deletar(id) {
        const [r] = await connection.execute(
            `UPDATE categoria SET ativo=0 WHERE idCategoria=?`,
            [id]
        );

        return r.affectedRows;
    }
};

export default categoriaRepository;