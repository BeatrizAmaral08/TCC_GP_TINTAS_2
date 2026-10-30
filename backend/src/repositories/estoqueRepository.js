import { connection } from "../configs/Database.js";

// Cria erros com código HTTP
function criarErro(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

// Valida identificadores
function validarId(valor) {
  const id = Number(valor);

  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === "" ||
    !Number.isSafeInteger(id) ||
    id <= 0
  ) {
    throw criarErro("Identificador inválido.");
  }

  return id;
}

// Valida quantidades de estoque
function validarQuantidade(valor, permitirZero = false) {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    throw criarErro("Quantidade inválida.");
  }

  const quantidade = Number(valor);

  if (
    !Number.isSafeInteger(quantidade) ||
    quantidade < 0 ||
    (!permitirZero && quantidade === 0)
  ) {
    throw criarErro("Quantidade inválida.");
  }

  return quantidade;
}

// Calcula o estoque depois da operação
function calcularEstoque(atual, operacao, quantidade) {
  let resultado;

  if (operacao === "entrada") {
    resultado = atual + quantidade;
  } else if (operacao === "saida") {
    resultado = atual - quantidade;
  } else {
    resultado = quantidade;
  }

  if (resultado < 0) {
    throw criarErro("Estoque insuficiente.");
  }

  if (!Number.isSafeInteger(resultado)) {
    throw criarErro("Quantidade de estoque inválida.");
  }

  return resultado;
}

// Sincroniza o estoque geral com as volumetrias
async function sincronizarEstoqueProduto(conn, idProduto) {
  const [[resultado]] = await conn.execute(
    `SELECT COALESCE(SUM(estoque), 0) AS total
     FROM produto_volumetria
     WHERE idProduto = ?`,
    [idProduto]
  );

  const total = Number(resultado.total);

  await conn.execute(
    `UPDATE produto
     SET estoque = ?
     WHERE idProduto = ?`,
    [total, idProduto]
  );

  return total;
}

const estoqueRepository = {

  // Altera manualmente o estoque de um produto ou volumetria
  async alterarEstoque(
    id,
    {
      operacao,
      quantidade,
      motivo,
      idUsuario,
      idProdutoVolumetria,
    }
  ) {
    const idProduto = validarId(id);

    // Valida a operação solicitada
    if (!["entrada", "saida", "definir"].includes(operacao)) {
      throw criarErro("Operação inválida.");
    }

    const qtd = validarQuantidade(
      quantidade,
      operacao === "definir"
    );

    const idVolume =
      idProdutoVolumetria == null ||
      idProdutoVolumetria === ""
        ? null
        : validarId(idProdutoVolumetria);

    const conn = await connection.getConnection();

    try {
      await conn.beginTransaction();

      // Bloqueia o produto durante a movimentação
      const [[produto]] = await conn.execute(
        `SELECT idProduto, nome, estoque
         FROM produto
         WHERE idProduto = ?
         FOR UPDATE`,
        [idProduto]
      );

      if (!produto) {
        throw criarErro("Produto não encontrado.", 404);
      }

      // Verifica se o produto possui volumetrias
      const [[contagem]] = await conn.execute(
        `SELECT COUNT(*) AS total
         FROM produto_volumetria
         WHERE idProduto = ?`,
        [idProduto]
      );

      const possuiVolumes = Number(contagem.total) > 0;

      // Produtos com volumetrias exigem a seleção do volume
      if (possuiVolumes && !idVolume) {
        throw criarErro(
          "Selecione a volumetria para alterar o estoque."
        );
      }

      if (!possuiVolumes && idVolume) {
        throw criarErro(
          "Este produto não possui volumetrias."
        );
      }

      let estoqueAnterior;
      let estoquePosterior;

      if (idVolume) {
        // Busca e bloqueia a volumetria selecionada
        const [[volume]] = await conn.execute(
          `SELECT idProdutoVolumetria, estoque
           FROM produto_volumetria
           WHERE idProdutoVolumetria = ?
             AND idProduto = ?
           FOR UPDATE`,
          [idVolume, idProduto]
        );

        if (!volume) {
          throw criarErro(
            "Volumetria não encontrada.",
            404
          );
        }

        estoqueAnterior = Number(volume.estoque);

        estoquePosterior = calcularEstoque(
          estoqueAnterior,
          operacao,
          qtd
        );

        // Atualiza o estoque da volumetria
        await conn.execute(
          `UPDATE produto_volumetria
           SET estoque = ?
           WHERE idProdutoVolumetria = ?`,
          [estoquePosterior, idVolume]
        );

        // Atualiza o estoque geral do produto
        await sincronizarEstoqueProduto(
          conn,
          idProduto
        );

      } else {
        // Mantém o controle para produtos sem volumetria
        estoqueAnterior = Number(produto.estoque);

        estoquePosterior = calcularEstoque(
          estoqueAnterior,
          operacao,
          qtd
        );

        await conn.execute(
          `UPDATE produto
           SET estoque = ?
           WHERE idProduto = ?`,
          [estoquePosterior, idProduto]
        );
      }

      // Registra a movimentação no histórico
      await conn.execute(
        `INSERT INTO movimentacao_estoque (
          idProduto,
          idProdutoVolumetria,
          tipo,
          quantidade,
          estoqueAnterior,
          estoquePosterior,
          motivo,
          idUsuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idProduto,
          idVolume,
          operacao,
          qtd,
          estoqueAnterior,
          estoquePosterior,
          motivo || "Ajuste pelo painel",
          idUsuario || null,
        ]
      );

      await conn.commit();

      return {
        idProduto,
        idProdutoVolumetria: idVolume,
        produto: produto.nome,
        estoqueAnterior,
        estoque: estoquePosterior,
      };

    } catch (error) {
      await conn.rollback();
      throw error;

    } finally {
      conn.release();
    }
  },

  // Baixa o estoque de uma volumetria após uma venda
  async baixarPorVenda(
    idProduto,
    idProdutoVolumetria,
    quantidade,
    idPedido,
    db = null
  ) {
    const produtoId = validarId(idProduto);
    const volumetriaId = validarId(idProdutoVolumetria);
    const pedidoId = validarId(idPedido);
    const qtd = validarQuantidade(quantidade);

    // Usa a transação do checkout, quando fornecida
    const transacaoExterna = db !== null;

    const conn = transacaoExterna
      ? db
      : await connection.getConnection();

    try {
      if (!transacaoExterna) {
        await conn.beginTransaction();
      }

      // Bloqueia o produto para manter a ordem dos bloqueios
      const [[produto]] = await conn.execute(
        `SELECT idProduto
         FROM produto
         WHERE idProduto = ?
         FOR UPDATE`,
        [produtoId]
      );

      if (!produto) {
        throw criarErro("Produto não encontrado.", 404);
      }

      // Busca e bloqueia a volumetria vendida
      const [[volumetria]] = await conn.execute(
        `SELECT
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
         FOR UPDATE`,
        [volumetriaId, produtoId]
      );

      if (!volumetria) {
        throw criarErro(
          "Volumetria não encontrada.",
          404
        );
      }

      if (!volumetria.ativo) {
        throw criarErro(
          "Esta volumetria não está disponível."
        );
      }

      const estoqueAnterior = Number(
        volumetria.estoque
      );

      const estoquePosterior =
        estoqueAnterior - qtd;

      if (estoquePosterior < 0) {
        throw criarErro(
          `Estoque insuficiente. Disponível: ${estoqueAnterior}`
        );
      }

      // Desconta o estoque da volumetria
      await conn.execute(
        `UPDATE produto_volumetria
         SET estoque = ?
         WHERE idProdutoVolumetria = ?`,
        [estoquePosterior, volumetriaId]
      );

      // Sincroniza o estoque geral após a venda
      await sincronizarEstoqueProduto(
        conn,
        produtoId
      );

      // Registra a baixa no histórico
      await conn.execute(
        `INSERT INTO movimentacao_estoque (
          idProduto,
          idProdutoVolumetria,
          tipo,
          quantidade,
          estoqueAnterior,
          estoquePosterior,
          motivo,
          idPedido
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          produtoId,
          volumetriaId,
          "venda",
          qtd,
          estoqueAnterior,
          estoquePosterior,
          "Baixa por venda",
          pedidoId,
        ]
      );

      // Confirma apenas transações próprias
      if (!transacaoExterna) {
        await conn.commit();
      }

      return {
        idProduto: produtoId,
        idProdutoVolumetria: volumetriaId,
        idPedido: pedidoId,
        produto: volumetria.nome,
        estoqueAnterior,
        estoque: estoquePosterior,
      };

    } catch (error) {
      // O checkout controla transações externas
      if (!transacaoExterna) {
        await conn.rollback();
      }

      throw error;

    } finally {
      if (!transacaoExterna) {
        conn.release();
      }
    }
  },

  // Lista o histórico de movimentações
  async listarMovimentacoes({
    idProduto,
    tipo,
  } = {}) {
    const where = [];
    const values = [];

    // Filtra as movimentações por produto
    if (
      idProduto !== undefined &&
      idProduto !== null &&
      idProduto !== ""
    ) {
      const id = validarId(idProduto);

      where.push("m.idProduto = ?");
      values.push(id);
    }

    // Filtra as movimentações por tipo
    if (tipo) {
      const tiposValidos = [
        "entrada",
        "saida",
        "definir",
        "venda",
      ];

      if (!tiposValidos.includes(tipo)) {
        throw criarErro(
          "Tipo de movimentação inválido."
        );
      }

      where.push("m.tipo = ?");
      values.push(tipo);
    }

    const filtro = where.length
      ? `WHERE ${where.join(" AND ")}`
      : "";

    const [rows] = await connection.execute(
      `SELECT
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
       ${filtro}
       ORDER BY
         m.dataMovimentacao DESC,
         m.idMovimentacao DESC`,
      values
    );

    return rows;
  },
};

export default estoqueRepository;
