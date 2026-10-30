import produtoVolumetriaRepository from "../repositories/produtoVolumetriaRepository.js";
import { ProdutoVolumetria } from "../models/ProdutoVolumetria.js";

// Validar identificadores
function validarId(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

// Validar porcentagem de desconto
function validarDesconto(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    const desconto = Number(valor);

    if (
        !Number.isFinite(desconto) ||
        desconto < 0 ||
        desconto > 100 ||
        !Number.isInteger(Math.round(desconto * 10000) / 100)
    ) {
        return null;
    }

    return desconto;
}

// Tratar erros do banco de dados
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

    // Erros de validação da aplicação
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

//controlle das volumetrias

const produtoVolumetriaController = {

    // Cadastro de volumetrias
    criar: async (req, res) => {
        try {
            const idProduto = validarId(req.params.idProduto);

            if (!idProduto) {
                return res.status(400).json({
                    message: "ID do produto inválido.",
                });
            }

            // Montar dados da volumetria
            const data = {
                ...req.body,
                idProduto,
            };

            // Validar com o model existente
            const volumetria = new ProdutoVolumetria(data);

            // Salvar no MySQL
            const resultado =
                await produtoVolumetriaRepository.criar(volumetria);

            return res.status(201).json(resultado);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao criar volumetria."
            );
        }
    },

    // Buscar volumetria pelo ID
    buscar: async (req, res) => {
        try {
            const id = validarId(req.params.id);

            if (!id) {
                return res.status(400).json({
                    message: "ID da volumetria inválido.",
                });
            }

            const volumetria =
                await produtoVolumetriaRepository.buscarPorId(id);

            if (!volumetria) {
                return res.status(404).json({
                    message: "Volumetria não encontrada.",
                });
            }

            return res.status(200).json(volumetria);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao buscar volumetria."
            );
        }
    },

    // Listar volumetrias de um produto
    listarPorProduto: async (req, res) => {
        try {
            const idProduto = validarId(req.params.idProduto);

            if (!idProduto) {
                return res.status(400).json({
                    message: "ID do produto inválido.",
                });
            }

            // Somente repositores e devs podem consultar inativas
            const perfil = req.user?.perfil || req.user?.tipo;
            const autorizado = ["repositor", "dev"].includes(perfil);

            const incluirInativas =
                req.query.incluirInativas === "true" &&
                autorizado;

            const volumetrias =
                await produtoVolumetriaRepository.listarPorProduto(
                    idProduto,
                    incluirInativas
                );

            return res.status(200).json(volumetrias);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao listar volumetrias."
            );
        }
    },

    //gerenciamento de descontos

    //adicionar ou alterar o desconto de uma volumetria
    salvarDesconto: async (req, res) => {
        try {
            const idProduto = validarId(req.params.idProduto);
            const idVolume = validarId(req.params.id);

            if (!idProduto || !idVolume) {
                return res.status(400).json({
                    message: "Produto ou volumetria inválidos.",
                });
            }

            // Receber e validar a porcentagem
            const desconto = validarDesconto(
                req.body?.desconto
            );

            if (desconto === null) {
                return res.status(400).json({
                    message: "Informe um desconto entre 0% e 100%, com até duas casas decimais.",
                });
            }

            // Atualizar o desconto no MySQL
            const volumetria =
                await produtoVolumetriaRepository.salvarDesconto(
                    idProduto,
                    idVolume,
                    desconto
                );

            return res.status(200).json({
                message: "Desconto salvo com sucesso.",
                volumetria,
            });

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao salvar desconto."
            );
        }
    },

    // Remover o desconto de uma volumetria
    removerDesconto: async (req, res) => {
        try {
            const idProduto = validarId(req.params.idProduto);
            const idVolume = validarId(req.params.id);

            if (!idProduto || !idVolume) {
                return res.status(400).json({
                    message: "Produto ou volumetria inválidos.",
                });
            }

            // Zerar o desconto para restaurar o preço original
            const volumetria =
                await produtoVolumetriaRepository.removerDesconto(
                    idProduto,
                    idVolume
                );

            return res.status(200).json({
                message: "Desconto removido com sucesso.",
                volumetria,
            });

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao remover desconto."
            );
        }
    },
};

export default produtoVolumetriaController;
