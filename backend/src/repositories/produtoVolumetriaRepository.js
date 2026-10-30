import { connection } from "../configs/Database.js";

// Valida o identificador da volumetria
function validarId(valor) {
    const id = Number(valor);

    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === "" ||
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        throw Object.assign(
            new Error("Identificador inválido."),
            { status: 400 }
        );
    }

    return id;
}

// Valida a porcentagem de desconto
function validarDesconto(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        throw Object.assign(
            new Error("Informe a porcentagem de desconto."),
            { status: 400 }
        );
    }

    const desconto = Number(valor);

    if (
        !Number.isFinite(desconto) ||
        desconto < 0 ||
        desconto > 100 ||
        Math.round(desconto * 100) !== desconto * 100
    ) {
        throw Object.assign(
            new Error("O desconto deve estar entre 0% e 100%, com até duas casas decimais."),
            { status: 400 }
        );
    }

    return desconto;
}

const produtoVolumetriaRepository = {

    // Cadastro de volumetrias
    async criar(volumetria) {
        const [resultado] = await connection.execute(
            `INSERT INTO produto_volumetria (
                idProduto,
                volume,
                unidade,
                preco,
                estoque,
                ativo,
                desconto
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                volumetria.idProduto,
                volumetria.volume,
                volumetria.unidade,
                volumetria.preco,
                volumetria.estoque,
                volumetria.ativo ? 1 : 0,
                0,
            ]
        );

        return this.buscarPorId(resultado.insertId);
    },

    // Lista as volumetrias de um produto
    async listarPorProduto(idProduto, incluirInativas = false) {
        const filtro = incluirInativas
            ? ""
            : "AND ativo = 1";

        const [rows] = await connection.execute(
            `SELECT
                idProdutoVolumetria AS id,
                idProduto,
                volume,
                unidade,
                preco,
                estoque,
                ativo,
                desconto,
                ROUND(
                    preco * (1 - desconto / 100),
                    2
                ) AS precoFinal
            FROM produto_volumetria
            WHERE idProduto = ?
            ${filtro}
            ORDER BY volume ASC`,
            [idProduto]
        );

        return rows;
    },

    // Busca uma volumetria pelo ID
    async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT
                idProdutoVolumetria AS id,
                idProduto,
                volume,
                unidade,
                preco,
                estoque,
                ativo,
                desconto,
                ROUND(
                    preco * (1 - desconto / 100),
                    2
                ) AS precoFinal
            FROM produto_volumetria
            WHERE idProdutoVolumetria = ?
            LIMIT 1`,
            [id]
        );

        return rows[0] || null;
    },

    // Salva ou altera o desconto de uma volumetria
    async salvarDesconto(
        idProduto,
        idProdutoVolumetria,
        porcentagem
    ) {
        const produtoId = validarId(idProduto);
        const volumetriaId = validarId(idProdutoVolumetria);
        const desconto = validarDesconto(porcentagem);

        // Confere se a volumetria pertence ao produto
        const [resultado] = await connection.execute(
            `UPDATE produto_volumetria
             SET desconto = ?
             WHERE idProdutoVolumetria = ?
               AND idProduto = ?`,
            [
                desconto,
                volumetriaId,
                produtoId,
            ]
        );

        if (resultado.affectedRows === 0) {
            throw Object.assign(
                new Error("Volumetria não encontrada neste produto."),
                { status: 404 }
            );
        }

        // Retorna a volumetria com o novo preço final
        return this.buscarPorId(volumetriaId);
    },

    // Remove o desconto e restaura o preço original
    async removerDesconto(
        idProduto,
        idProdutoVolumetria
    ) {
        return this.salvarDesconto(
            idProduto,
            idProdutoVolumetria,
            0
        );
    },
};

export default produtoVolumetriaRepository;
