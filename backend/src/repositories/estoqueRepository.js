import { connection } from "../configs/Database.js";

const estoqueRepository = {

    //altera manualmente o estoque de um produto
    async alterarEstoque(
        id,
        { operacao, quantidade, motivo, idUsuario }
    ) {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();


            //busca o produto e bloqueia o registro durante a transação
            const [[produto]] = await conn.execute(
                `
                SELECT idProduto, nome, estoque
                FROM produto
                WHERE idProduto = ?
                FOR UPDATE
                `,
                [id]
            );

            // Verifica se o produto existe
            if (!produto) {
                throw Object.assign(
                    new Error("Produto não encontrado"),
                    { status: 404 }
                );
            }

            // Converte a quantidade para um número inteiro
            const qtd = Math.trunc(Number(quantidade));

            // Verifica se a quantidade é válida
            if (!Number.isInteger(qtd) || qtd < 0) {
                throw Object.assign(
                    new Error("Quantidade inválida"),
                    { status: 400 }
                );
            }

            // Define as operações disponíveis para alteração do estoque
            const operacoes = {
                entrada: estoque => estoque + qtd,
                saida: estoque => estoque - qtd,
                definir: () => qtd
            };

            // Verifica se a operação informada é válida
            if (!operacoes[operacao]) {
                throw Object.assign(
                    new Error(
                        "Operação deve ser entrada, saida ou definir"
                    ),
                    { status: 400 }
                );
            }

            // Calcula o novo valor do estoque
            const novo = operacoes[operacao](
                Number(produto.estoque)
            );

            // Impede que o estoque fique negativo
            if (novo < 0) {
                throw Object.assign(
                    new Error("Estoque insuficiente"),
                    { status: 400 }
                );
            }

            // Registra a movimentação realizada no histórico do estoque
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

    //realiza a baixa do estoque automaticamente após uma venda
    async baixarPorVenda(
        idProduto,
        idProdutoVolumetria,
        quantidade,
        idPedido
    ) {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            //converte a quantidade vendida para número inteiro
            const qtd = Math.trunc(Number(quantidade));

            if (!Number.isInteger(qtd) || qtd <= 0) {
                throw Object.assign(
                    new Error("Quantidade de venda inválida"),
                    { status: 400 }
                );
            }

            // busca a volumetria do produto e bloqueia o registro
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

            //verifica se a volumetria existe
            if (!volumetria) {
                throw Object.assign(
                    new Error(
                        "Volumetria do produto não encontrada"
                    ),
                    { status: 404 }
                );
            }

            //verifica se a volumetria está ativa
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

            //impede a realização da venda caso não exista estoque suficiente
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

    //lista o histórico de movimentações do estoque
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

            ${where.length
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