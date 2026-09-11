import { connection } from '../configs/Database.js';

const estoqueRepository = {

    // altera o estoque de um produto
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
                    new Error('Produto não encontrado'),
                    { status: 404 }
                );
            }

            const qtd = Math.trunc(Number(quantidade));

            if (!Number.isInteger(qtd) || qtd < 0) {
                throw Object.assign(
                    new Error('Quantidade inválida'),
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
                        'Operação deve ser entrada, saida ou definir'
                    ),
                    { status: 400 }
                );
            }

            const novo = operacoes[operacao](produto.estoque);

            if (novo < 0) {
                throw Object.assign(
                    new Error('Estoque insuficiente'),
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
                    motivo || 'Ajuste pelo painel',
                    idUsuario || null
                ]
            );

            await conn.commit();

            return {
                idProduto: id,
                produto: produto.nome,
                estoqueAnterior: produto.estoque,
                estoque: novo
            };

        } catch (e) {

            await conn.rollback();
            throw e;

        } finally {

            conn.release();
        }
    }
};

export default estoqueRepository;