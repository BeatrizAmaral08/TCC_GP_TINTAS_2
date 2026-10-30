import carrinhoRepository from "../repositories/carrinhoRepository.js";
import carrinhoItemRepository from "../repositories/carrinhoItemRepository.js";
import { CarrinhoItem } from "../models/CarrinhoItem.js";

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

function validarQuantidade(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    const quantidade = Number(valor);

    return Number.isSafeInteger(quantidade) &&
        quantidade > 0
        ? quantidade
        : null;
}

function tratarErro(error, res, mensagem) {
    console.error(mensagem, error);

    if (
        ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"]
            .includes(error.code)
    ) {
        return res.status(503).json({
            message: "Banco de dados indisponível.",
        });
    }

    if (
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status < 500
    ) {
        return res.status(error.status).json({
            message: error.message,
        });
    }

    return res.status(500).json({
        message: mensagem,
    });
}

//controller do carrinho

const carrinhoController = {

    //adicionar item ao carrinho

    adicionar: async (req, res) => {
        try {
            const idCliente = req.user.id;

            const idProdutoVolumetria = validarId(
                req.body?.idProdutoVolumetria
            );

            const quantidade = validarQuantidade(
                req.body?.quantidade
            );

            if (!idProdutoVolumetria) {
                return res.status(400).json({
                    message: "Volumetria inválida.",
                });
            }

            if (!quantidade) {
                return res.status(400).json({
                    message: "Quantidade inválida.",
                });
            }

            const carrinho =
                await carrinhoRepository.buscarOuCriar(idCliente);

            const item = new CarrinhoItem({
                idCarrinho: carrinho.idCarrinho,
                idProdutoVolumetria,
                quantidade,
            });

            const resultado =
                await carrinhoItemRepository.adicionar(item);

            return res.status(201).json(resultado);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao adicionar item ao carrinho."
            );
        }
    },

    //listar carrinho

    listar: async (req, res) => {
        try {
            const idCliente = req.user.id;

            const carrinho =
                await carrinhoRepository.buscarOuCriar(idCliente);

            const itens =
                await carrinhoItemRepository.listarPorCarrinho(
                    carrinho.idCarrinho
                );

            const total = itens.reduce(
                (soma, item) =>
                    soma + Number(item.subtotal),
                0
            );

            return res.status(200).json({
                carrinho,
                itens,
                total: Number(total.toFixed(2)),
            });

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao listar carrinho."
            );
        }
    },

  //atualizar quantidade

    atualizarQuantidade: async (req, res) => {
        try {
            const idCliente = req.user.id;

            const idItem = validarId(req.params.id);

            const quantidade = validarQuantidade(
                req.body?.quantidade
            );

            if (!idItem) {
                return res.status(400).json({
                    message: "ID do item inválido.",
                });
            }

            if (!quantidade) {
                return res.status(400).json({
                    message: "Quantidade inválida.",
                });
            }

            const carrinho =
                await carrinhoRepository.buscarPorCliente(idCliente);

            if (!carrinho) {
                return res.status(404).json({
                    message: "Carrinho não encontrado.",
                });
            }

            const item =
                await carrinhoItemRepository.buscarPorId(idItem);

            if (!item) {
                return res.status(404).json({
                    message: "Item do carrinho não encontrado.",
                });
            }

            if (
                Number(item.idCarrinho) !==
                Number(carrinho.idCarrinho)
            ) {
                return res.status(403).json({
                    message: "Você não pode alterar este item.",
                });
            }

            const resultado =
                await carrinhoItemRepository.atualizarQuantidade(
                    idItem,
                    quantidade
                );

            return res.status(200).json(resultado);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao atualizar quantidade."
            );
        }
    },

   //remover item

    remover: async (req, res) => {
        try {
            const idCliente = req.user.id;
            const idItem = validarId(req.params.id);

            if (!idItem) {
                return res.status(400).json({
                    message: "ID do item inválido.",
                });
            }

            const carrinho =
                await carrinhoRepository.buscarPorCliente(idCliente);

            if (!carrinho) {
                return res.status(404).json({
                    message: "Carrinho não encontrado.",
                });
            }

            const item =
                await carrinhoItemRepository.buscarPorId(idItem);

            if (!item) {
                return res.status(404).json({
                    message: "Item do carrinho não encontrado.",
                });
            }

            if (
                Number(item.idCarrinho) !==
                Number(carrinho.idCarrinho)
            ) {
                return res.status(403).json({
                    message: "Você não pode remover este item.",
                });
            }

            const removido =
                await carrinhoItemRepository.remover(idItem);

            if (!removido) {
                return res.status(404).json({
                    message: "Item do carrinho não encontrado.",
                });
            }

            return res.status(200).json({
                message: "Item removido do carrinho.",
            });

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao remover item do carrinho."
            );
        }
    },
};

export default carrinhoController;
