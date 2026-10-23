import { connection } from "../configs/Database.js";

const selectVolumetria = `
    SELECT
        idProdutoVolumetria AS id,
        idProduto,
        volume,
        unidade,
        preco,
        estoque,
        rendimento,
        ativo
    FROM produto_volumetria
`;

const produtoVolumetriaRepository = {
    async criar(volumetria) {
        const [resultado] = await connection.execute(
            `
            INSERT INTO produto_volumetria (
                idProduto, volume, unidade, preco, estoque, rendimento, ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                volumetria.idProduto,
                volumetria.volume,
                volumetria.unidade,
                volumetria.preco,
                volumetria.estoque,
                volumetria.rendimento,
                volumetria.ativo ? 1 : 0
            ]
        );

        return this.buscarPorId(resultado.insertId);
    },

    async listarPorProduto(idProduto) {
        const [rows] = await connection.execute(
            `${selectVolumetria}
             WHERE idProduto = ? AND ativo = 1
             ORDER BY volume ASC`,
            [idProduto]
        );
        return rows;
    },

    async listarParaCalculo(idProduto) {
        const [rows] = await connection.execute(
            `${selectVolumetria}
             WHERE idProduto = ? AND ativo = 1
             ORDER BY volume ASC`,
            [idProduto]
        );
        return rows;
    },

    async buscarPorId(id) {
        const [rows] = await connection.execute(
            `${selectVolumetria}
             WHERE idProdutoVolumetria = ?
             LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    },
};

export default produtoVolumetriaRepository;
