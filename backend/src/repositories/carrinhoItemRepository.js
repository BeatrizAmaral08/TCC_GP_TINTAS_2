import { connection } from "../configs/Database.js";

// Cria um erro de validação com status HTTP
function erroValidacao(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

// Verifica se a quantidade é um número inteiro positivo
function validarQuantidade(valor) {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    throw erroValidacao("Quantidade inválida.");
  }

  const quantidade = Number(valor);

  if (
    !Number.isSafeInteger(quantidade) ||
    quantidade <= 0
  ) {
    throw erroValidacao("Quantidade inválida.");
  }

  return quantidade;
}

// Campos reutilizados nas consultas do carrinho
// O desconto é calculado diretamente pelo MySQL
const camposItem = `
  ci.idCarrinhoItem,
  ci.idCarrinho,
  ci.idProdutoVolumetria,
  ci.quantidade,

  pv.volume,
  pv.unidade,
  pv.estoque,
  pv.ativo,

  pv.preco AS precoOriginal,

  COALESCE(pv.desconto, 0) AS desconto,

  ROUND(
    pv.preco *
    (1 - COALESCE(pv.desconto, 0) / 100),
    2
  ) AS preco,

  ROUND(
    pv.preco *
    (1 - COALESCE(pv.desconto, 0) / 100),
    2
  ) AS precoFinal,

  (
    ci.quantidade *
    ROUND(
      pv.preco *
      (1 - COALESCE(pv.desconto, 0) / 100),
      2
    )
  ) AS subtotal,

  p.idProduto,
  p.nome AS produto
`;

const carrinhoItemRepository = {

  //adiciona item ao carrinho
  async adicionar(item) {
    const quantidade = validarQuantidade(
      item.quantidade
    );

    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // Bloqueia a volumetria durante a operação
      const [[volumetria]] = await conn.execute(
        `SELECT
          idProdutoVolumetria,
          estoque,
          ativo
        FROM produto_volumetria
        WHERE idProdutoVolumetria = ?
        FOR UPDATE`,
        [item.idProdutoVolumetria]
      );

      if (!volumetria) {
        throw erroValidacao(
          "Volumetria não encontrada.",
          404
        );
      }

      if (!volumetria.ativo) {
        throw erroValidacao(
          "Esta volumetria não está disponível."
        );
      }

      // Verifica se a volumetria já está no carrinho
      const [[itemExistente]] = await conn.execute(
        `SELECT
          idCarrinhoItem,
          quantidade
        FROM carrinho_item
        WHERE idCarrinho = ?
          AND idProdutoVolumetria = ?
        LIMIT 1
        FOR UPDATE`,
        [
          item.idCarrinho,
          item.idProdutoVolumetria
        ]
      );

      // Soma a quantidade quando o item já existe
      const quantidadeFinal = itemExistente
        ? Number(itemExistente.quantidade) + quantidade
        : quantidade;

      // Verifica o estoque disponível
      if (
        !Number.isSafeInteger(quantidadeFinal) ||
        quantidadeFinal > Number(volumetria.estoque)
      ) {
        throw erroValidacao(
          `Quantidade inválida ou estoque insuficiente. Disponível: ${volumetria.estoque}`
        );
      }

      let idCarrinhoItem;

      if (itemExistente) {
        // Atualiza a quantidade do item existente
        idCarrinhoItem = itemExistente.idCarrinhoItem;

        await conn.execute(
          `UPDATE carrinho_item
          SET quantidade = ?
          WHERE idCarrinhoItem = ?`,
          [quantidadeFinal, idCarrinhoItem]
        );

      } else {
        // Adiciona uma nova volumetria ao carrinho
        const [resultado] = await conn.execute(
          `INSERT INTO carrinho_item (
            idCarrinho,
            idProdutoVolumetria,
            quantidade
          )
          VALUES (?, ?, ?)`,
          [
            item.idCarrinho,
            item.idProdutoVolumetria,
            quantidade
          ]
        );

        idCarrinhoItem = resultado.insertId;
      }

      // Retorna o item com o preço atualizado
      const resultado = await this.buscarPorId(
        idCarrinhoItem,
        conn
      );

      await conn.commit();

      return resultado;

    } catch (error) {
      await conn.rollback();
      throw error;

    } finally {
      conn.release();
    }
  },

  //lista os itens do carrinho

  async listarPorCarrinho(
    idCarrinho,
    db = connection
  ) {
    const [rows] = await db.execute(
      `SELECT
        ${camposItem}
      FROM carrinho_item ci
      JOIN produto_volumetria pv
        ON pv.idProdutoVolumetria =
          ci.idProdutoVolumetria
      JOIN produto p
        ON p.idProduto = pv.idProduto
      WHERE ci.idCarrinho = ?
      ORDER BY ci.idCarrinhoItem ASC`,
      [idCarrinho]
    );

    return rows;
  },

  //busca um item pelo id
  async buscarPorId(
    idCarrinhoItem,
    db = connection
  ) {
    const [rows] = await db.execute(
      `SELECT
        ${camposItem}
      FROM carrinho_item ci
      JOIN produto_volumetria pv
        ON pv.idProdutoVolumetria =
          ci.idProdutoVolumetria
      JOIN produto p
        ON p.idProduto = pv.idProduto
      WHERE ci.idCarrinhoItem = ?
      LIMIT 1`,
      [idCarrinhoItem]
    );

    return rows[0] || null;
  },

  //atualiza quantidade do item
  async atualizarQuantidade(
    idCarrinhoItem,
    valor
  ) {
    const quantidade = validarQuantidade(valor);
    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // Identifica a volumetria do item
      const [[referencia]] = await conn.execute(
        `SELECT idProdutoVolumetria
        FROM carrinho_item
        WHERE idCarrinhoItem = ?`,
        [idCarrinhoItem]
      );

      if (!referencia) {
        throw erroValidacao(
          "Item do carrinho não encontrado.",
          404
        );
      }

      // Bloqueia a volumetria para conferir o estoque
      const [[volumetria]] = await conn.execute(
        `SELECT
          estoque,
          ativo
        FROM produto_volumetria
        WHERE idProdutoVolumetria = ?
        FOR UPDATE`,
        [referencia.idProdutoVolumetria]
      );

      // Bloqueia também o item do carrinho
      const [[item]] = await conn.execute(
        `SELECT idCarrinhoItem
        FROM carrinho_item
        WHERE idCarrinhoItem = ?
          AND idProdutoVolumetria = ?
        FOR UPDATE`,
        [
          idCarrinhoItem,
          referencia.idProdutoVolumetria
        ]
      );

      if (!item || !volumetria) {
        throw erroValidacao(
          "Item do carrinho não encontrado.",
          404
        );
      }

      if (!volumetria.ativo) {
        throw erroValidacao(
          "Esta volumetria não está disponível."
        );
      }

      // Impede uma quantidade maior que o estoque
      if (
        quantidade > Number(volumetria.estoque)
      ) {
        throw erroValidacao(
          `Estoque insuficiente. Disponível: ${volumetria.estoque}`
        );
      }

      // Atualiza a quantidade solicitada
      await conn.execute(
        `UPDATE carrinho_item
        SET quantidade = ?
        WHERE idCarrinhoItem = ?`,
        [quantidade, idCarrinhoItem]
      );

      // Consulta o novo subtotal promocional
      const resultado = await this.buscarPorId(
        idCarrinhoItem,
        conn
      );

      await conn.commit();

      return resultado;

    } catch (error) {
      await conn.rollback();
      throw error;

    } finally {
      conn.release();
    }
  },

  //remover iem do carrinho

  async remover(idCarrinhoItem) {
    const [resultado] = await connection.execute(
      `DELETE FROM carrinho_item
      WHERE idCarrinhoItem = ?`,
      [idCarrinhoItem]
    );

    return resultado.affectedRows;
  },

  //limpa o carrinho após o cehckout

  async limparCarrinho(
    idCarrinho,
    db = connection
  ) {
    const [resultado] = await db.execute(
      `DELETE FROM carrinho_item
      WHERE idCarrinho = ?`,
      [idCarrinho]
    );

    return resultado.affectedRows;
  }
};

export default carrinhoItemRepository;
