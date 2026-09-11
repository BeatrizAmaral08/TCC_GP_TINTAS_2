import enderecoRepository from "../repositories/enderecoRepository.js";
import { Endereco } from "../models/Endereco.js";

const enderecoController = {
    
    // cria um endereço para o cliente logado
    criar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const data = {
                ...req.body,
                idCliente
            };

            const endereco = new Endereco(data);

            const resultado =
                await enderecoRepository.criar(
                    endereco
                );

            return res.status(201).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message: error.status
                    ? error.message
                    : "Erro ao criar endereço",
                errorMessage: error.message
            });
        }
    },

    // lista os endereços do cliente logado
    listar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const enderecos =
                await enderecoRepository.listarPorCliente(
                    idCliente
                );

            return res.status(200).json(enderecos);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao listar endereços",
                errorMessage: error.message
            });
        }
    },

    // busca um endereço do cliente logado
    buscar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const endereco =
                await enderecoRepository.buscarPorId(
                    req.params.id
                );

            if (!endereco) {
                return res.status(404).json({
                    message: "Endereço não encontrado"
                });
            }

            // impede acessar endereço de outro cliente
            if (endereco.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode acessar este endereço"
                });
            }

            return res.status(200).json(endereco);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao buscar endereço",
                errorMessage: error.message
            });
        }
    },

    // atualiza um endereço do cliente logado
    atualizar: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const enderecoAtual =
                await enderecoRepository.buscarPorId(
                    req.params.id
                );

            if (!enderecoAtual) {
                return res.status(404).json({
                    message: "Endereço não encontrado"
                });
            }

            // impede alterar endereço de outro cliente
            if (enderecoAtual.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode alterar este endereço"
                });
            }

            const data = {
                ...req.body,
                idCliente
            };

            const endereco = new Endereco(data);

            const resultado =
                await enderecoRepository.atualizar(
                    req.params.id,
                    endereco
                );

            return res.status(200).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message: error.status
                    ? error.message
                    : "Erro ao atualizar endereço",
                errorMessage: error.message
            });
        }
    },

    // remove o endereço desejado
    remover: async (req, res) => {
        try {

            const idCliente = req.user.id;

            const endereco =
                await enderecoRepository.buscarPorId(
                    req.params.id
                );

            if (!endereco) {
                return res.status(404).json({
                    message: "Endereço não encontrado"
                });
            }

            // impede remover endereço de outro cliente
            if (endereco.idCliente !== idCliente) {
                return res.status(403).json({
                    message:
                        "Você não pode remover este endereço"
                });
            }

            await enderecoRepository.remover(
                req.params.id
            );

            return res.status(200).json({
                message: "Endereço removido com sucesso"
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao remover endereço",
                errorMessage: error.message
            });
        }
    }
};

export default enderecoController;
