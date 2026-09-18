import { connection } from "../configs/Database.js";

const produtoVolumetriaRepository = {

    //criar uma volumetria para escolha
    async criar(volumetria) {

        const [resultado] = await connection.execute(
            `
            INSERT INTO produto_volumetria (
                idProduto,
                volume,
                unidade,
                preco,
                estoque,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                volumetria.idProduto,
                volumetria.volume,
                volumetria.unidade,
                volumetria.preco,
                volumetria.estoque,
                volumetria.ativo ? 1 : 0
            ]
        );

        return this.buscarPorId(resultado.insertId);
    },

    // listar as volumetrias disponiveis de um produto
    async listarPorProduto(idProduto) {

        const [rows] = await connection.execute(
            `
            SELECT
                idProdutoVolumetria AS id,
                idProduto,
                volume,
                unidade,
                preco,
                estoque,
                ativo
            FROM produto_volumetria
            WHERE idProduto = ?
              AND ativo = 1
            ORDER BY volume ASC
            `,
            [idProduto]
        );

        return rows;
    },

    // buscar uma volumetria pelo ID
    async buscarPorId(id) {

        const [rows] = await connection.execute(
            `
            SELECT
                idProdutoVolumetria AS id,
                idProduto,
                volume,
                unidade,
                preco,
                estoque,
                ativo
            FROM produto_volumetria
            WHERE idProdutoVolumetria = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },

};

export default produtoVolumetriaRepository;
