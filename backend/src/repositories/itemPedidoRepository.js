import { connection } from "../configs/Database.js";

const itemPedidoRepository = {

    //cria um item do pedido
    async criar(item, db = connection) {
        const [resultado] = await db.execute(
            `INSERT INTO itempedido (
        idPedido,
        idProduto,
        idProdutoVolumetria,
        quantidade,
        subtotal
      )
      VALUES (?, ?, ?, ?, ?)`,
            [
                item.idPedido,
                item.idProduto,
                item.idProdutoVolumetria,
                item.quantidade,
                item.subtotal
            ]
        );

        return this.buscarPorId(resultado.insertId, db);
    },

   //lista os itens de um pedido

    async listarPorPedido(idPedido, db = connection) {
        const [rows] = await db.execute(
            `SELECT
        ip.idItemPedido,
        ip.idPedido,
        ip.idProduto,
        ip.idProdutoVolumetria,
        ip.quantidade,
        ip.subtotal,
        p.nome AS produto,
        pv.volume,
        pv.unidade,
        pv.preco
      FROM itempedido ip
      JOIN produto p
        ON p.idProduto = ip.idProduto
      JOIN produto_volumetria pv
        ON pv.idProdutoVolumetria =
          ip.idProdutoVolumetria
      WHERE ip.idPedido = ?
      ORDER BY ip.idItemPedido ASC`,
            [idPedido]
        );

        return rows;
    },

    //busca um item pelo id

    async buscarPorId(idItemPedido, db = connection) {
        const [rows] = await db.execute(
            `SELECT
        ip.idItemPedido,
        ip.idPedido,
        ip.idProduto,
        ip.idProdutoVolumetria,
        ip.quantidade,
        ip.subtotal,
        p.nome AS produto,
        pv.volume,
        pv.unidade,
        pv.preco
      FROM itempedido ip
      JOIN produto p
        ON p.idProduto = ip.idProduto
      JOIN produto_volumetria pv
        ON pv.idProdutoVolumetria =
          ip.idProdutoVolumetria
      WHERE ip.idItemPedido = ?
      LIMIT 1`,
            [idItemPedido]
        );

        return rows[0] || null;
    }
};

export default itemPedidoRepository;
