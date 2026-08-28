import produtoRepository from "../repositories/produtoRepository.js";
import { Produto } from "../models/Produto.js";

const produtoController = {

     //criar produto
    criar: async (req, res) => {
        try {
            const data = {
                ...req.body
            };

            //adicionar imagem
            if (req.file) {
                data.imagem = `/uploads/${req.file.filename}`;
            }

            const produto = new Produto(data);

            const resultado =
                await produtoRepository.criar(produto);

            return res.status(201).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao criar produto",
                errorMessage: error.message
            });
        }
    },

    //listar produtos
    listar: async (req, res) => {
        try {
            const produtos = await produtoRepository.listar({
                busca: req.query.busca || req.query.q,
                categoriaId: req.query.categoriaId,
                categoria: req.query.categoria,
                incluirInativos: req.query.todos === "true",
                apenasPromocoes: req.query.promocoes === "true"
            });

            return res.status(200).json(produtos);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao listar produtos",
                errorMessage: error.message
            });
        }
    },

    //buscar produto por id
    buscar: async (req, res) => {
        try {
            const produto = await produtoRepository.buscarPorId(
                req.params.id
            );

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado"
                });
            }

            return res.status(200).json(produto);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao buscar produto",
                errorMessage: error.message
            });
        }
    },

   

    //atualizar produto
    atualizar: async (req, res) => {
        try {
            const data = {
                ...req.body
            };

            //adicionar nova imagem
            if (req.file) {
                data.imagem = `/uploads/${req.file.filename}`;
            }

            //converter preço
            if (data.preco !== undefined) {
                data.preco = Number(data.preco);
            }

            //converter preço promocional
            if (
                data.precoPromocional !== undefined &&
                data.precoPromocional !== ""
            ) {
                data.precoPromocional =
                    Number(data.precoPromocional);
            }

            //converter estoque
            if (data.estoque !== undefined) {
                data.estoque = Number(data.estoque);
            }

            //converter estoque mínimo
            if (data.estoqueMinimo !== undefined) {
                data.estoqueMinimo =
                    Number(data.estoqueMinimo);
            }

            const produto =
                await produtoRepository.atualizar(
                    req.params.id,
                    data
                );

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado"
                });
            }

            return res.status(200).json(produto);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao atualizar produto",
                errorMessage: error.message
            });
        }
    },

    //deletar produto
    deletar: async (req, res) => {
        try {
            const ok =
                await produtoRepository.deletar(
                    req.params.id
                );

            if (!ok) {
                return res.status(404).json({
                    message: "Produto não encontrado"
                });
            }

            return res.status(200).json({
                message: "Produto desativado"
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao deletar produto",
                errorMessage: error.message
            });
        }
    },

    //alterar estoque
    estoque: async (req, res) => {
        try {
            const resultado =
                await produtoRepository.alterarEstoque(
                    req.params.id,
                    {
                        ...req.body,
                        idUsuario: req.user.id
                    }
                );

            return res.status(200).json(resultado);

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao alterar estoque",
                errorMessage: error.message
            });
        }
    }

};

export default produtoController;