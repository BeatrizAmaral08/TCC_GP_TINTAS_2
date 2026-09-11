import pedidoRepository from "../repositories/pedidoRepository.js";
import itemPedidoRepository from "../repositories/itemPedidoRepository.js";
import carrinhoRepository from "../repositories/carrinhoRepository.js";
import carrinhoItemRepository from "../repositories/carrinhoItemRepository.js";
import enderecoRepository from "../repositories/enderecoRepository.js";

const pedidoController = {

    //crira um novo pedido
    criar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const pedido = await pedidoRepository.criar({
                idCliente: idCliente,
                data: req.body.data,
                statusEntrega: req.body.statusEntrega,
                valorTotal: req.body.valorTotal,
                formaPagamento: req.body.formaPagamento
            });

            return res.status(201).json(pedido);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao criar pedido",
                errorMessage: error.message
            });
        }
    },

    //realiza o checkout do carrinho
    checkout: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const { idEndereco, formaPagamento } = req.body;

            const endereco =
                await enderecoRepository.buscarPorId(
                    idEndereco
                );

            if (!endereco) {
                return res.status(404).json({
                    message: "Endereço não encontrado"
                });
            }

            if (endereco.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode usar este endereço"
                });
            }

            if (!formaPagamento) {
                return res.status(400).json({
                    message:
                        "Forma de pagamento é obrigatória"
                });
            }

            const carrinho =
                await carrinhoRepository.buscarPorCliente(
                    idCliente
                );

            if (!carrinho) {
                return res.status(400).json({
                    message: "Carrinho vazio"
                });
            }

            const itens =
                await carrinhoItemRepository.listarPorCarrinho(
                    carrinho.idCarrinho
                );

            if (!itens.length) {
                return res.status(400).json({
                    message: "Carrinho vazio"
                });
            }

            const valorTotal = itens.reduce(
                (total, item) =>
                    total + Number(item.subtotal),
                0
            );

            const pedido =
                await pedidoRepository.criar({
                    idCliente,
                    data: new Date()
                        .toISOString()
                        .slice(0, 10),
                    statusEntrega: "Pendente",
                    valorTotal,
                    formaPagamento
                });

            const itensPedido = [];

            for (const item of itens) {

                const itemPedido =
                    await itemPedidoRepository.criar({
                        idPedido: pedido.idPedido,
                        idProduto: item.idProduto,
                        idProdutoVolumetria:
                            item.idProdutoVolumetria,
                        quantidade: item.quantidade,
                        subtotal: Number(item.subtotal)
                    });

                itensPedido.push(itemPedido);
            }

            return res.status(201).json({
                message: "Checkout realizado com sucesso",
                pedido,
                endereco,
                itens: itensPedido
            });

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message: error.status
                    ? error.message
                    : "Erro ao realizar checkout",
                errorMessage: error.message
            });
        }
    },

    // lista os pedidos do cliente logado
    listar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const pedidos =
                await pedidoRepository.listarPorCliente(
                    idCliente
                );

            return res.status(200).json(pedidos);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao listar pedidos",
                errorMessage: error.message
            });
        }
    },

    //permite ao cliente acompanhar o status dos seus pedidos
    acompanharStatus: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const pedidos =
                await pedidoRepository.acompanharStatus(
                    idCliente
                );

            if (!pedidos.length) {
                return res.status(404).json({
                    message: "Nenhum pedido encontrado"
                });
            }

            return res.status(200).json({
                pedidos
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao consultar status dos pedidos",
                errorMessage: error.message
            });
        }
    },

    // busca um pedido especifico do cliente
    buscar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const pedido =
                await pedidoRepository.buscarPorId(
                    req.params.id
                );

            if (!pedido) {
                return res.status(404).json({
                    message: "Pedido não encontrado"
                });
            }

            if (pedido.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode acessar este pedido"
                });
            }

            return res.status(200).json(pedido);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao buscar pedido",
                errorMessage: error.message
            });
        }
    },

    // edita um pedido
    editar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const pedido =
                await pedidoRepository.buscarPorId(
                    req.params.id
                );

            if (!pedido) {
                return res.status(404).json({
                    message: "Pedido não encontrado"
                });
            }

            if (pedido.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode editar este pedido"
                });
            }

            const pedidoAtualizado =
                await pedidoRepository.editar(
                    req.params.id,
                    req.body
                );

            return res.status(200).json(
                pedidoAtualizado
            );

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao editar pedido",
                errorMessage: error.message
            });
        }
    },

    // exclui um pedido
    excluir: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const pedido =
                await pedidoRepository.buscarPorId(
                    req.params.id
                );

            if (!pedido) {
                return res.status(404).json({
                    message: "Pedido não encontrado"
                });
            }

            if (pedido.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode excluir este pedido"
                });
            }

            await pedidoRepository.excluir(
                req.params.id
            );

            return res.status(200).json({
                message: "Pedido excluído com sucesso"
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao excluir pedido",
                errorMessage: error.message
            });
        }
    }
};

export default pedidoController;
