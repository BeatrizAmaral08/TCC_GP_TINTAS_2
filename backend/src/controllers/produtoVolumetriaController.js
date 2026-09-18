import produtoVolumetriaRepository from "../repositories/produtoVolumetriaRepository.js";
import { ProdutoVolumetria } from "../models/ProdutoVolumetria.js";

const produtoVolumetriaController = {


    //criar volumetria
    criar: async (req, res) => {
        try {

            const data = {
                ...req.body,
                idProduto: Number(req.params.idProduto)
            };

            const volumetria =
                new ProdutoVolumetria(data);

            const resultado =
                await produtoVolumetriaRepository.criar(
                    volumetria
                );

            return res.status(201).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message: error.status
                    ? error.message
                    : "Erro ao criar volumetria",
                errorMessage: error.message
            });
        }
    },


    
    // buscar volumetria por ID
    buscar: async (req, res) => {
        try {

            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID da volumetria inválido"
                });
            }

            const volumetria =
                await produtoVolumetriaRepository.buscarPorId(id);

            if (!volumetria) {
                return res.status(404).json({
                    message: "Volumetria não encontrada"
                });
            }

            return res.status(200).json(volumetria);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao buscar volumetria",
                errorMessage: error.message
            });
        }
    },

    // listar volumetrias de um produto
    listarPorProduto: async (req, res) => {
        try {

            const idProduto = Number(req.params.idProduto);

            if (!Number.isInteger(idProduto) || idProduto <= 0) {
                return res.status(400).json({
                    message: "ID do produto inválido"
                });
            }

            const volumetrias =
                await produtoVolumetriaRepository.listarPorProduto(
                    idProduto
                );

            return res.status(200).json(volumetrias);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao listar volumetrias",
                errorMessage: error.message
            });
        }
    },

};

export default produtoVolumetriaController;
