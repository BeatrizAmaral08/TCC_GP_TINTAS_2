import { connection } from "../configs/Database.js";

const carrinhoItemRepository = {

    // adiciona um item ao carrinho verificando o estoque disponivel
    async adicionar(item) {

        // verifica se a volumetria existe e consulta o estoque
        const [[volumetria]] = await connection.execute(
            `
        SELECT
            idProdutoVolumetria,
            estoque,
            ativo
        FROM produto_volumetria
        WHERE idProdutoVolumetria = ?
        LIMIT 1
        `,
            [item.idProdutoVolumetria]
        );

        // verifica se a volumetria da tinta existe
        if (!volumetria) {
            throw Object.assign(
                new Error("Volumetria não encontrada"),
                { status: 404 }
            );
        }

        // verifica se a volumetria está ativa
        if (!volumetria.ativo) {
            throw Object.assign(
                new Error("Esta volumetria não está disponível"),
                { status: 400 }
            );
        }

        // procura se essa volumetria já está no carrinho
        const [[itemExistente]] = await connection.execute(
            `
        SELECT
            idCarrinhoItem,
            quantidade
        FROM carrinho_item
        WHERE idCarrinho = ?
          AND idProdutoVolumetria = ?
        LIMIT 1
        `,
            [
                item.idCarrinho,
                item.idProdutoVolumetria
            ]
        );

        // calcula a quantidade final
        const quantidadeFinal =
            itemExistente
                ? itemExistente.quantidade + item.quantidade
                : item.quantidade;

        // verifica se o estoque suporta a quantidade final
        if (quantidadeFinal > volumetria.estoque) {
            throw Object.assign(
                new Error(
                    `Estoque insuficiente. Disponível: ${volumetria.estoque}`
                ),
                { status: 400 }
            );
        }

        // se o item já existe, apenas soma a quantidade
        if (itemExistente) {

            await connection.execute(
                `
            UPDATE carrinho_item
            SET quantidade = ?
            WHERE idCarrinhoItem = ?
            `,
                [
                    quantidadeFinal,
                    itemExistente.idCarrinhoItem
                ]
            );

            return this.buscarPorId(
                itemExistente.idCarrinhoItem
            );
        }

        // caso ainda não exista, cria um novo item
        const [resultado] = await connection.execute(
            `
        INSERT INTO carrinho_item (
            idCarrinho,
            idProdutoVolumetria,
            quantidade
        )
        VALUES (?, ?, ?)
        `,
            [
                item.idCarrinho,
                item.idProdutoVolumetria,
                item.quantidade
            ]
        );

        return this.buscarPorId(
            resultado.insertId
        );
    },


    //busca todos os itens do carrinho
    async listarPorCarrinho(idCarrinho) {

        const [rows] = await connection.execute(
            `
            SELECT
                ci.idCarrinhoItem,
                ci.idCarrinho,
                ci.idProdutoVolumetria,
                ci.quantidade,

                pv.volume,
                pv.unidade,
                pv.preco,

                (ci.quantidade * pv.preco) AS subtotal,

                p.idProduto,


                p.idProduto,
                p.nome AS produto

            FROM carrinho_item ci

            JOIN produto_volumetria pv
                ON pv.idProdutoVolumetria =
                   ci.idProdutoVolumetria

            JOIN produto p
                ON p.idProduto = pv.idProduto

            WHERE ci.idCarrinho = ?

            ORDER BY ci.idCarrinhoItem ASC
            `,
            [idCarrinho]
        );

        return rows;
    },

    //busca um item específico do carrinho
    async buscarPorId(idCarrinhoItem) {

        const [rows] = await connection.execute(
            `
            SELECT
                ci.idCarrinhoItem,
                ci.idCarrinho,
                ci.idProdutoVolumetria,
                ci.quantidade,

                pv.volume,
                pv.unidade,
                pv.preco,

                (ci.quantidade * pv.preco) AS subtotal,

                p.idProduto,
                
                p.nome AS produto

            FROM carrinho_item ci

            JOIN produto_volumetria pv
                ON pv.idProdutoVolumetria =
                   ci.idProdutoVolumetria

            JOIN produto p
                ON p.idProduto = pv.idProduto

            WHERE ci.idCarrinhoItem = ?

            LIMIT 1
            `,
            [idCarrinhoItem]
        );

        return rows[0] || null;
    },


    // atualiza a quantidade do item verificando o estoque disponivel
    async atualizarQuantidade(
        idCarrinhoItem,
        quantidade
    ) {

        const [[item]] = await connection.execute(
            `
        SELECT
            ci.idCarrinhoItem,
            ci.idProdutoVolumetria,
            pv.estoque,
            pv.ativo
        FROM carrinho_item ci

        JOIN produto_volumetria pv
            ON pv.idProdutoVolumetria =
               ci.idProdutoVolumetria

        WHERE ci.idCarrinhoItem = ?
        LIMIT 1
        `,
            [idCarrinhoItem]
        );

        // verifica se o item existe
        if (!item) {
            throw Object.assign(
                new Error("Item do carrinho não encontrado"),
                { status: 404 }
            );
        }

        // verifica se a volumetria está ativa
        if (!item.ativo) {
            throw Object.assign(
                new Error("Esta volumetria não está disponível"),
                { status: 400 }
            );
        }

        // verifica se existe estoque suficiente
        if (quantidade > item.estoque) {
            throw Object.assign(
                new Error(
                    `Estoque insuficiente. Disponível: ${item.estoque}`
                ),
                { status: 400 }
            );
        }

        await connection.execute(
            `
        UPDATE carrinho_item
        SET quantidade = ?
        WHERE idCarrinhoItem = ?
        `,
            [
                quantidade,
                idCarrinhoItem
            ]
        );

        return this.buscarPorId(
            idCarrinhoItem
        );
    },

    //remove um item do carrinho
    async remover(idCarrinhoItem) {

        const [resultado] =
            await connection.execute(
                `
                DELETE FROM carrinho_item
                WHERE idCarrinhoItem = ?
                `,
                [idCarrinhoItem]
            );

        return resultado.affectedRows;
    }
};

export default carrinhoItemRepository;
