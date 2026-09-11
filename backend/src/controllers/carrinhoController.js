import carrinhoRepository from "../repositories/carrinhoRepository.js";
import carrinhoItemRepository from "../repositories/carrinhoItemRepository.js";
import { CarrinhoItem } from "../models/CarrinhoItem.js";

const carrinhoController = {

    // adiciona um produto ao carrinho
    adicionar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const carrinho =
                await carrinhoRepository.buscarOuCriar(
                    idCliente
                );

            const data = {
                ...req.body,
                idCarrinho: carrinho.idCarrinho
            };

            const item = new CarrinhoItem(data);

            const resultado =
                await carrinhoItemRepository.adicionar(
                    item
                );

            return res.status(201).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message: error.status
                    ? error.message
                    : "Erro ao adicionar item ao carrinho",
                errorMessage: error.message
            });
        }
    },

    // lista os itens do carrinho do cliente
    listar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const carrinho =
                await carrinhoRepository.buscarOuCriar(
                    idCliente
                );

            const itens =
                await carrinhoItemRepository.listarPorCarrinho(
                    carrinho.idCarrinho
                );

            // calcula o valor total dos produtos
            const total = itens.reduce(
                (soma, item) =>
                    soma + Number(item.subtotal),
                0
            );

            return res.status(200).json({
                carrinho,
                itens,
                total
            });


        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao listar carrinho",
                errorMessage: error.message
            });
        }
    },

    // altera a quantidade de um item
    atualizarQuantidade: async (req, res) => {
        try {

            const idCliente = req.user.id;

            // busca o carrinho do cliente logado
            const carrinho =
                await carrinhoRepository.buscarPorCliente(
                    idCliente
                );

            if (!carrinho) {
                return res.status(404).json({
                    message: "Carrinho não encontrado"
                });
            }

            const quantidade =
                Math.trunc(
                    Number(req.body.quantidade)
                );

            if (
                !Number.isInteger(quantidade) ||
                quantidade <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Quantidade deve ser maior que zero"
                });
            }

            // busca o item para verificar a qual carrinho ele pertence
            const item =
                await carrinhoItemRepository.buscarPorId(
                    req.params.id
                );

            if (!item) {
                return res.status(404).json({
                    message: "Item do carrinho não encontrado"
                });
            }

            // impede alterar item de outro cliente
            if (item.idCarrinho !== carrinho.idCarrinho) {
                return res.status(403).json({
                    message:
                        "Você não pode alterar este item"
                });
            }

            const resultado =
                await carrinhoItemRepository.atualizarQuantidade(
                    req.params.id,
                    quantidade
                );

            return res.status(200).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message: error.status
                    ? error.message
                    : "Erro ao atualizar quantidade",
                errorMessage: error.message
            });
        }
    },

    // remove um item do carrinho
    remover: async (req, res) => {
        try {

            const idCliente = req.user.id;

            // busca o carrinho do cliente logado
            const carrinho =
                await carrinhoRepository.buscarPorCliente(
                    idCliente
                );

            if (!carrinho) {
                return res.status(404).json({
                    message: "Carrinho não encontrado"
                });
            }

            // busca o item que será removido
            const item =
                await carrinhoItemRepository.buscarPorId(
                    req.params.id
                );

            if (!item) {
                return res.status(404).json({
                    message: "Item do carrinho não encontrado"
                });
            }

            // impede remover item de outro cliente
            if (item.idCarrinho !== carrinho.idCarrinho) {
                return res.status(403).json({
                    message:
                        "Você não pode remover este item"
                });
            }

            const removido =
                await carrinhoItemRepository.remover(
                    req.params.id
                );

            if (!removido) {
                return res.status(404).json({
                    message: "Item do carrinho não encontrado"
                });
            }

            return res.status(200).json({
                message: "Item removido do carrinho"
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message:
                    "Erro ao remover item do carrinho",
                errorMessage: error.message
            });
        }
    },


};

export default carrinhoController;
