import { connection } from "../configs/Database.js";
import pedidoRepository from "../repositories/pedidoRepository.js";
import itemPedidoRepository from "../repositories/itemPedidoRepository.js";
import carrinhoItemRepository from "../repositories/carrinhoItemRepository.js";
import enderecoRepository from "../repositories/enderecoRepository.js";
import estoqueRepository from "../repositories/estoqueRepository.js";

function criarErro(message, status = 400) {
    return Object.assign(new Error(message), { status });
}

function validarId(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    const id = Number(valor);

    return Number.isSafeInteger(id) && id > 0
        ? id
        : null;
}

function tratarErro(error, res, mensagem) {
    console.error(mensagem, error);

    if (
        ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"]
            .includes(error.code)
    ) {
        return res.status(503).json({
            message: "Banco de dados indisponível."
        });
    }

    if (
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status < 500
    ) {
        return res.status(error.status).json({
            message: error.message
        });
    }

    return res.status(500).json({
        message: mensagem
    });
}

const pedidoController = {

    checkout: async (req, res) => {
        let conn;
        let transacaoIniciada = false;

        try {
            const idCliente = req.user.id;

            const idEndereco = validarId(
                req.body?.idEndereco
            );

            const formaPagamento = String(
                req.body?.formaPagamento ?? ""
            ).trim();

            if (!idEndereco) {
                return res.status(400).json({
                    message: "Selecione um endereço válido."
                });
            }

            if (
                !formaPagamento ||
                formaPagamento.length > 50
            ) {
                return res.status(400).json({
                    message: "Forma de pagamento inválida."
                });
            }

            conn = await connection.getConnection();

            await conn.beginTransaction();
            transacaoIniciada = true;

            // Verificar endereço do cliente
            const endereco =
                await enderecoRepository.buscarPorId(
                    idEndereco,
                    conn
                );

            if (!endereco) {
                throw criarErro(
                    "Endereço não encontrado.",
                    404
                );
            }

            if (
                Number(endereco.idCliente) !==
                Number(idCliente)
            ) {
                throw criarErro(
                    "Você não pode usar este endereço.",
                    403
                );
            }

            // Bloquear o carrinho durante o checkout
            const [[carrinho]] = await conn.execute(
                `SELECT
          idCarrinho,
          idCliente
        FROM carrinho
        WHERE idCliente = ?
        LIMIT 1
        FOR UPDATE`,
                [idCliente]
            );

            if (!carrinho) {
                throw criarErro("Carrinho vazio.");
            }

            // Buscar os itens na mesma conexão
            const itens =
                await carrinhoItemRepository.listarPorCarrinho(
                    carrinho.idCarrinho,
                    conn
                );

            if (!itens.length) {
                throw criarErro("Carrinho vazio.");
            }

            // Ordenar volumetrias para bloquear
            // os registros em ordem consistente
            const itensOrdenados = [...itens].sort(
                (a, b) =>
                    Number(a.idProdutoVolumetria) -
                    Number(b.idProdutoVolumetria)
            );

            const itensValidados = [];
            let totalCentavos = 0;

            // Conferir preços e disponibilidade
            for (const item of itensOrdenados) {
                const quantidade = Number(item.quantidade);

                if (
                    !Number.isSafeInteger(quantidade) ||
                    quantidade <= 0
                ) {
                    throw criarErro(
                        "Quantidade inválida no carrinho."
                    );
                }

                // Busca o preço, desconto e estoque atual da volumetria
                // Bloqueia o registro para garantir uma compra consistente
                const [[volumetria]] = await conn.execute(
                    `SELECT
                    idProdutoVolumetria,
                    idProduto,
                    preco,
                    COALESCE(desconto, 0) AS desconto,
                    estoque,
                    ativo
                    FROM produto_volumetria
                    WHERE idProdutoVolumetria = ?
                     FOR UPDATE`,
                    [item.idProdutoVolumetria]
                );

                if (!volumetria || !volumetria.ativo) {
                    throw criarErro(
                        "Uma volumetria do carrinho não está disponível."
                    );
                }

                if (
                    quantidade > Number(volumetria.estoque)
                ) {
                    throw criarErro(
                        `Estoque insuficiente para ${item.produto}.`
                    );
                }

                // Obtém o preço original e o desconto do banco
                const precoOriginal = Number(volumetria.preco);
                const desconto = Number(volumetria.desconto);

                // Valida o preço cadastrado
                if (
                    !Number.isFinite(precoOriginal) ||
                    precoOriginal < 0
                ) {
                    throw criarErro(
                        "Preço inválido para um produto."
                    );
                }

                // Valida a porcentagem de desconto
                if (
                    !Number.isFinite(desconto) ||
                    desconto < 0 ||
                    desconto > 100
                ) {
                    throw criarErro(
                        "Desconto inválido para um produto."
                    );
                }

                // Calcula o preço unitário já com desconto
                // Trabalha com centavos para evitar erros monetários
                const precoOriginalCentavos = Math.round(
                    precoOriginal * 100
                );

                const precoCentavos = Math.round(
                    precoOriginalCentavos * (1 - desconto / 100)
                );

                // Calcula o subtotal da volumetria
                const subtotalCentavos =
                    precoCentavos * quantidade;

                if (
                    !Number.isSafeInteger(subtotalCentavos) ||
                    !Number.isSafeInteger(
                        totalCentavos + subtotalCentavos
                    )
                ) {
                    throw criarErro(
                        "Valor do pedido inválido."
                    );
                }

                totalCentavos += subtotalCentavos;

                itensValidados.push({
                    idProduto: Number(volumetria.idProduto),
                    idProdutoVolumetria:
                        Number(volumetria.idProdutoVolumetria),
                    quantidade,
                    subtotal: subtotalCentavos / 100
                });
            }

            const valorTotal = totalCentavos / 100;

            // Criar pedido dentro da transação
            const pedido = await pedidoRepository.criar(
                {
                    idCliente,
                    data: new Date().toISOString().slice(0, 10),
                    statusEntrega: "Pendente",
                    valorTotal,
                    formaPagamento
                },
                conn
            );

            const itensPedido = [];

            // Registrar itens e baixar estoque
            for (const item of itensValidados) {

                await estoqueRepository.baixarPorVenda(
                    item.idProduto,
                    item.idProdutoVolumetria,
                    item.quantidade,
                    pedido.idPedido,
                    conn
                );

                const itemPedido =
                    await itemPedidoRepository.criar(
                        {
                            idPedido: pedido.idPedido,
                            idProduto: item.idProduto,
                            idProdutoVolumetria:
                                item.idProdutoVolumetria,
                            quantidade: item.quantidade,
                            subtotal: item.subtotal
                        },
                        conn
                    );

                itensPedido.push(itemPedido);
            }

            // Limpar itens do carrinho
            await carrinhoItemRepository.limparCarrinho(
                carrinho.idCarrinho,
                conn
            );

            // Confirmar todas as operações
            await conn.commit();
            transacaoIniciada = false;

            return res.status(201).json({
                message: "Pedido registrado com sucesso.",
                pedido,
                endereco,
                itens: itensPedido
            });

        } catch (error) {
            if (conn && transacaoIniciada) {
                try {
                    await conn.rollback();
                } catch (rollbackError) {
                    console.error(
                        "Erro ao desfazer checkout:",
                        rollbackError
                    );
                }
            }

            return tratarErro(
                error,
                res,
                "Erro ao realizar checkout."
            );

        } finally {
            if (conn) {
                conn.release();
            }
        }
    },

    //lista os pedidos dos clientes

    listar: async (req, res) => {
        try {
            const pedidos =
                await pedidoRepository.listarPorCliente(
                    req.user.id
                );

            return res.status(200).json(pedidos);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao listar pedidos."
            );
        }
    },

    //acompanhamento do status

    acompanharStatus: async (req, res) => {
        try {
            const pedidos =
                await pedidoRepository.acompanharStatus(
                    req.user.id
                );

            return res.status(200).json({
                pedidos
            });

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao consultar status dos pedidos."
            );
        }
    },

    //lista de todos os pedidos

    listarTodos: async (req, res) => {
        try {
            const pedidos =
                await pedidoRepository.listarTodos();

            return res.status(200).json(pedidos);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao listar pedidos da loja."
            );
        }
    },

    //alteração de status pela administração

    alterarStatus: async (req, res) => {
        try {
            const idPedido = validarId(req.params.id);

            if (!idPedido) {
                return res.status(400).json({
                    message: "ID do pedido inválido."
                });
            }

            const statusEntrega = req.body?.statusEntrega;

            const statusPermitidos = [
                "Pendente",
                "Em Separação",
                "Enviado",
                "Entregue"
            ];

            if (!statusPermitidos.includes(statusEntrega)) {
                return res.status(400).json({
                    message: "Status de entrega inválido."
                });
            }

            const pedido =
                await pedidoRepository.buscarPorId(idPedido);

            if (!pedido) {
                return res.status(404).json({
                    message: "Pedido não encontrado."
                });
            }

            const pedidoAtualizado =
                await pedidoRepository.alterarStatus(
                    idPedido,
                    statusEntrega
                );

            return res.status(200).json({
                message: "Status atualizado com sucesso.",
                pedido: pedidoAtualizado
            });

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao atualizar status do pedido."
            );
        }
    },

    //busca depedido pelo id

    buscar: async (req, res) => {
        try {
            const idPedido = validarId(req.params.id);

            if (!idPedido) {
                return res.status(400).json({
                    message: "ID do pedido inválido."
                });
            }

            const pedido =
                await pedidoRepository.buscarPorId(idPedido);

            if (!pedido) {
                return res.status(404).json({
                    message: "Pedido não encontrado."
                });
            }

            const perfil = req.user.perfil;

            const administrativo = [
                "repositor",
                "dev"
            ].includes(perfil);

            const proprietario =
                Number(pedido.idCliente) ===
                Number(req.user.id);

            if (!administrativo && !proprietario) {
                return res.status(403).json({
                    message: "Você não pode acessar este pedido."
                });
            }

            return res.status(200).json(pedido);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao buscar pedido."
            );
        }
    },


    criar: async (req, res) => {
        return res.status(403).json({
            message: "Utilize o checkout para criar pedidos."
        });
    },

    editar: async (req, res) => {
        return res.status(403).json({
            message: "Edição direta de pedidos não permitida."
        });
    },

    excluir: async (req, res) => {
        return res.status(403).json({
            message: "Exclusão direta de pedidos não permitida."
        });
    }
};

export default pedidoController;
