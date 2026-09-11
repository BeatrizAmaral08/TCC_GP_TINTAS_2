import { connection } from "../configs/Database.js";

const select = `
    SELECT
        id,
        nome,
        email,
        cpf
    FROM cliente
`;

const clienteRepository = {

    // Criar cliente
    async criar(data) {

        const {
            nome,
            email,
            cpf
        } = data;

        const sql = `
            INSERT INTO cliente (
                nome,
                email,
                cpf
            )
            VALUES (?, ?, ?)
        `;

        const values = [
            nome,
            email,
            cpf
        ];

        const [result] = await connection.execute(
            sql,
            values
        );

        return this.buscarPorId(result.insertId);
    },

    // Listar clientes
    async selecionar() {

        const [rows] = await connection.execute(`
            ${select}
            ORDER BY nome
        `);

        return rows;
    },

    // Buscar cliente por ID
    async buscarPorId(id) {

        const [rows] = await connection.execute(
            `${select} WHERE id=? LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    },

    // Atualizar cliente
    async atualizar(id, data) {

        const map = {
            nome: "nome",
            email: "email",
            cpf: "cpf"
        };

        const campos = Object.entries(map)
            .filter(([key]) => data[key] !== undefined)
            .map(([key, coluna]) => [
                `${coluna}=?`,
                data[key]
            ]);

        if (!campos.length) {
            return this.buscarPorId(id);
        }

        const sets = campos.map(([sql]) => sql);

        const values = campos.map(([_, value]) => value);

        values.push(id);

        const [result] = await connection.execute(
            `
            UPDATE cliente
            SET ${sets.join(", ")}
            WHERE id=?
            `,
            values
        );

        return result.affectedRows
            ? this.buscarPorId(id)
            : null;
    },

    // Excluir cliente
    async deletar(id) {

        const [result] = await connection.execute(
            `
            DELETE FROM cliente
            WHERE id=?
            `,
            [id]
        );

        return result.affectedRows > 0;
    }
};

export default clienteRepository;
