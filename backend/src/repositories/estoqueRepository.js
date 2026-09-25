import { connection } from "../configs/Database.js";

const estoqueRepository = {

    async alterarEstoque(
        id,
        { operacao, quantidade, motivo, idUsuario }
    ) {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [[produto]] = await conn.execute(
                `
                SELECT idProduto, nome, estoque
                FROM produto
                WHERE idProduto = ?
                FOR UPDATE
                `,
                [id]
            );

            if (!produto) {
                throw Object.assign(
                    new Error("Produto não encontrado"),
                    { status: 404 }
                );
            }

            const qtd = Math.trunc(Number(quantidade));

            if (!Number.isInteger(qtd) || qtd < 0) {
                throw Object.assign(
                    new Error("Quantidade inválida"),
                    { status: 400 }
                );
            }

            const operacoes = {
                entrada: estoque => estoque + qtd,
                saida: estoque => estoque - qtd,
                definir: () => qtd
            };

            if (!operacoes[operacao]) {
                throw Object.assign(
                    new Error(
                        "Operação deve ser entrada, saida ou definir"
                    ),
                    { status: 400 }
                );
            }

            const novo = operacoes[operacao](
                Number(produto.estoque)
            );

            if (novo < 0) {
                throw Object.assign(
                    new Error("Estoque insuficiente"),
                    { status: 400 }
                );
            }

            await conn.execute(
                `
                UPDATE produto
                SET estoque = ?
                WHERE idProduto = ?
                `,
                [novo, id]
            );

            await conn.execute(
                `
                INSERT INTO movimentacao_estoque (
                    idProduto,
                    tipo,
                    quantidade,
                    estoqueAnterior,
                    estoquePosterior,
                    motivo,
                    idUsuario
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    id,
                    operacao,
                    qtd,
                    produto.estoque,
                    novo,
                    motivo || "Ajuste pelo painel",
                    idUsuario || null
                ]
            );

            await conn.commit();

            return {
                idProduto: id,
                produto: produto.nome,
                estoqueAnterior: Number(produto.estoque),
                estoque: novo
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    async baixarPorVenda(
        idProduto,
        idProdutoVolumetria,
        quantidade,
        idPedido
    ) {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const qtd = Math.trunc(Number(quantidade));

            if (!Number.isInteger(qtd) || qtd <= 0) {
                throw Object.assign(
                    new Error("Quantidade de venda inválida"),
                    { status: 400 }
                );
            }

            const [[volumetria]] = await conn.execute(
                `
                SELECT
                    pv.idProdutoVolumetria,
                    pv.idProduto,
                    pv.estoque,
                    pv.ativo,
                    p.nome
                FROM produto_volumetria pv
                JOIN produto p
                    ON p.idProduto = pv.idProduto
                WHERE pv.idProdutoVolumetria = ?
                  AND pv.idProduto = ?
                FOR UPDATE
                `,
                [idProdutoVolumetria, idProduto]
            );

            if (!volumetria) {
                throw Object.assign(
                    new Error(
                        "Volumetria do produto não encontrada"
                    ),
                    { status: 404 }
                );
            }

            if (!volumetria.ativo) {
                throw Object.assign(
                    new Error(
                        "Esta volumetria não está disponível"
                    ),
                    { status: 400 }
                );
            }

            const estoqueAnterior =
                Number(volumetria.estoque);

            const estoquePosterior =
                estoqueAnterior - qtd;

            if (estoquePosterior < 0) {
                throw Object.assign(
                    new Error(
                        `Estoque insuficiente. Disponível: ${estoqueAnterior}`
                    ),
                    { status: 400 }
                );
            }

            await conn.execute(
                `
                UPDATE produto_volumetria
                SET estoque = ?
                WHERE idProdutoVolumetria = ?
                `,
                [
                    estoquePosterior,
                    idProdutoVolumetria
                ]
            );

            await conn.execute(
                `
                INSERT INTO movimentacao_estoque (
                    idProduto,
                    idProdutoVolumetria,
                    tipo,
                    quantidade,
                    estoqueAnterior,
                    estoquePosterior,
                    motivo,
                    idPedido
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    idProduto,
                    idProdutoVolumetria,
                    "venda",
                    qtd,
                    estoqueAnterior,
                    estoquePosterior,
                    "Baixa por venda",
                    idPedido
                ]
            );

            await conn.commit();

            return {
                idProduto,
                idProdutoVolumetria,
                idPedido,
                produto: volumetria.nome,
                estoqueAnterior,
                estoque: estoquePosterior
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    async listarMovimentacoes({
        idProduto,
        tipo
    } = {}) {
        const where = [];
        const values = [];

        if (idProduto) {
            const id = Number(idProduto);

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                throw Object.assign(
                    new Error("Produto inválido"),
                    { status: 400 }
                );
            }

            where.push(
                "m.idProduto = ?"
            );

            values.push(id);
        }

        if (tipo) {
            const tiposValidos = [
                "entrada",
                "saida",
                "definir",
                "venda"
            ];

            if (!tiposValidos.includes(tipo)) {
                throw Object.assign(
                    new Error(
                        "Tipo de movimentação inválido"
                    ),
                    { status: 400 }
                );
            }

            where.push(
                "m.tipo = ?"
            );

            values.push(tipo);
        }

        const [rows] = await connection.execute(
            `
            SELECT
                m.idMovimentacao,
                m.idProduto,
                m.idProdutoVolumetria,
                m.tipo,
                m.quantidade,
                m.estoqueAnterior,
                m.estoquePosterior,
                m.motivo,
                m.idUsuario,
                m.idPedido,
                m.dataMovimentacao,
                p.nome AS produto,
                pv.volume,
                pv.unidade,
                u.nome AS usuario
            FROM movimentacao_estoque m

            JOIN produto p
                ON p.idProduto = m.idProduto

            LEFT JOIN produto_volumetria pv
                ON pv.idProdutoVolumetria =
                   m.idProdutoVolumetria

            LEFT JOIN usuario u
                ON u.idUsuario = m.idUsuario

            ${
                where.length
                    ? `WHERE ${where.join(" AND ")}`
                    : ""
            }

            ORDER BY
                m.dataMovimentacao DESC,
                m.idMovimentacao DESC
            `,
            values
        );

        return rows;
    }
};

export default estoqueRepository;