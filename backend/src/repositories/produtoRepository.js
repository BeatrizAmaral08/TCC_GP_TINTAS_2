import { connection } from "../configs/Database.js";

const select = `
    SELECT 
        p.idProduto AS id,
        p.idCategoria AS categoriaId,
        c.nome AS categoria,
        p.nome,
        p.descricao,
        p.marca,
        p.preco,
        p.precoPromocional,
        p.desconto,
        p.estoque,
        p.estoqueMinimo,
        p.unidade,
        p.imagem,
        p.ativo,
        p.dataCad,
        p.dataAlt
    FROM produto p
    JOIN categoria c ON c.idCategoria = p.idCategoria
`;

const produtoRepository = {

    // cria um novo produto
    async criar(p) {

        const [r] = await connection.execute(
            `
            INSERT INTO produto (
                idCategoria,
                nome,
                descricao,
                marca,
                preco,
                precoPromocional,
                desconto,
                estoque,
                estoqueMinimo,
                unidade,
                imagem,
                ativo
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            `,
            [
                p.idCategoria,
                p.nome,
                p.descricao,
                p.marca,
                p.preco,
                p.precoPromocional,
                p.desconto,
                p.estoque,
                p.estoqueMinimo,
                p.unidade,
                p.imagem,
                p.ativo ? 1 : 0
            ]
        );

        return this.buscarPorId(r.insertId);
    },

    // lista os produtos aplicando os filtros
    async listar({
        busca = "",
        categoriaId,
        categoria,
        precoMin,
        precoMax,
        incluirInativos = false,
        apenasPromocoes = false
    } = {}) {

        const where = [];
        const values = [];

        // somente produtos ativos
        if (!incluirInativos) {
            where.push("p.ativo = 1");
        }

        // busca textual
        if (busca) {

            where.push(
                "(p.nome LIKE ? OR p.descricao LIKE ? OR p.marca LIKE ? OR c.nome LIKE ?)"
            );

            const q = `%${busca}%`;

            values.push(q, q, q, q);
        }

        // filtro por categoria através do ID
        if (
            categoriaId !== undefined &&
            categoriaId !== ""
        ) {

            const idCategoria = Number(categoriaId);

            if (
                !Number.isInteger(idCategoria) ||
                idCategoria <= 0
            ) {
                throw Object.assign(
                    new Error("Categoria inválida"),
                    { status: 400 }
                );
            }

            where.push("p.idCategoria = ?");

            values.push(idCategoria);
        }

        // filtro por nome da categoria
        if (categoria) {

            where.push("c.nome = ?");

            values.push(categoria);
        }

        // preço mínimo
        if (
            precoMin !== undefined &&
            precoMin !== ""
        ) {

            const valorMinimo = Number(precoMin);

            if (
                Number.isNaN(valorMinimo) ||
                valorMinimo < 0
            ) {
                throw Object.assign(
                    new Error("Preço mínimo inválido"),
                    { status: 400 }
                );
            }

            where.push("p.preco >= ?");

            values.push(valorMinimo);
        }

        // preço máximo
        if (
            precoMax !== undefined &&
            precoMax !== ""
        ) {

            const valorMaximo = Number(precoMax);

            if (
                Number.isNaN(valorMaximo) ||
                valorMaximo < 0
            ) {
                throw Object.assign(
                    new Error("Preço máximo inválido"),
                    { status: 400 }
                );
            }

            where.push("p.preco <= ?");

            values.push(valorMaximo);
        }

        // verifica se a faixa de preço é válida
        if (
            precoMin !== undefined &&
            precoMin !== "" &&
            precoMax !== undefined &&
            precoMax !== ""
        ) {

            const valorMinimo = Number(precoMin);
            const valorMaximo = Number(precoMax);

            if (valorMinimo > valorMaximo) {
                throw Object.assign(
                    new Error(
                        "O preço mínimo não pode ser maior que o preço máximo"
                    ),
                    { status: 400 }
                );
            }
        }

        // somente produtos em promoção
        if (apenasPromocoes) {

            where.push(
                "p.precoPromocional IS NOT NULL AND p.precoPromocional < p.preco"
            );
        }

        const query = `
            ${select}
            ${
                where.length
                    ? `WHERE ${where.join(" AND ")}`
                    : ""
            }
            ORDER BY p.idProduto DESC
        `;

        const [rows] =
            await connection.execute(
                query,
                values
            );

        return rows;
    },

    // busca um produto pelo ID
    async buscarPorId(id) {

        const [rows] =
            await connection.execute(
                `${select}
                 WHERE p.idProduto = ?
                 LIMIT 1`,
                [id]
            );

        return rows[0] || null;
    },

    // atualiza apenas os campos informados
    async atualizar(id, data) {

        const map = {
            idCategoria: "idCategoria",
            categoriaId: "idCategoria",
            nome: "nome",
            descricao: "descricao",
            marca: "marca",
            preco: "preco",
            precoPromocional: "precoPromocional",
            desconto: "desconto",
            unidade: "unidade",
            imagem: "imagem",
            ativo: "ativo"
        };

        const campos = Object.entries(map)
            .filter(
                ([key]) =>
                    data[key] !== undefined
            )
            .map(([key, col]) => [
                `${col} = ?`,
                key === "ativo"
                    ? (data[key] ? 1 : 0)
                    : (
                        data[key] === ""
                            ? null
                            : data[key]
                    )
            ]);

        if (!campos.length) {
            return this.buscarPorId(id);
        }

        const fields =
            campos.map(([field]) => field);

        const values =
            campos.map(
                ([_, value]) => value
            );

        values.push(id);

        await connection.execute(
            `
            UPDATE produto
            SET ${fields.join(", ")}
            WHERE idProduto = ?
            `,
            values
        );

        return this.buscarPorId(id);
    },

    // desativa o produto sem remover do banco
    async deletar(id) {

        const [r] =
            await connection.execute(
                `
                UPDATE produto
                SET ativo = 0
                WHERE idProduto = ?
                `,
                [id]
            );

        return r.affectedRows;
    }
};

export default produtoRepository;