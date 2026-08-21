import { connection } from "../configs/Database.js";

    const select = ` SELECT idCliente AS id,
    nome,
    email,
    cpf,
    telefone,
    cep,
    numero,
    complemento,
    perfil,
    ativo,
    dataCad
FROM cliente`;

const clienteRepository = {
    async selecionar({ perfil, incluirInativos = false } = {}) {

        const where = [];
        const values = [];

        if (!incluirInativos) where.push("ativo=1");
        if (perfil) {
            where.push("perfil=?");
            values.push(perfil);
        }

        const sql = `
      ${select}
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY nome
    `;
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    async buscarPorId(id) {
        const [rows] = await connection.execute(
            `${select} WHERE idCliente=? LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    },

    async atualizar(id, data) {
        const map = {
            nome: "nome",
            email: "email",
            cpf: "cpf",
            telefone: "telefone",
            cep: "cep",
            numero: "numero",
            complemento: "complemento"
        };

        const campos = Object.entries(map)
            .filter(([key]) => data[key] !== undefined)
            .map(([key, col]) => [`${col}=?`, data[key] || null]);

        if (!campos.length) return this.buscarPorId(id);

        const sets = campos.map(([s]) => s);
        
        const values = campos.map(([_, v]) => v);
        values.push(id);

        const [r] = await connection.execute(
            `UPDATE cliente SET ${sets.join(", ")} WHERE idCliente=?`,
            values
        );

        return r.affectedRows ? this.buscarPorId(id) : null;
    },

    async deletar(id) {
        const [r] = await connection.execute(
            "UPDATE cliente SET ativo=0 WHERE idCliente=?",
            [id]
        );
        return r.affectedRows > 0;
    },

    async alterarPerfil(id, perfil) {
        const [r] = await connection.execute(
            "UPDATE cliente SET perfil=? WHERE idCliente=?",
            [perfil, id]
        );
        return r.affectedRows > 0;
    },

    async alterarStatus(id, ativo) {
        const [r] = await connection.execute(
            "UPDATE cliente SET ativo=? WHERE idCliente=?",
            [ativo ? 1 : 0, id]
        );
        return r.affectedRows > 0;
    }
};

export default clienteRepository;