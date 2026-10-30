import produtoRepository from "../repositories/produtoRepository.js";
import { Produto } from "../models/produto.js";

const produtoController = {
    // Criar produto
    criar: async (req, res) => {
        try {
            const data = { ...req.body };
            const pasta = "/uploads/produtos/";

            data.imagens = [];

            if (req.files) {
                // Foto principal da tinta
                if (req.files.imagemLata) {
                    data.imagem = pasta + req.files.imagemLata[0].filename;
                }

                // Foto principal dos acessórios
                else if (req.files.imagemPrincipal) {
                    data.imagem = pasta + req.files.imagemPrincipal[0].filename;
                }

                // Fotos adicionais das tintas
                const nomes = [
                    "imagemCor",
                    "imagemSala",
                    "imagemQuarto",
                    "imagemCozinha",
                    "imagemQuintal",
                ];

                nomes.forEach((nome) => {
                    if (req.files[nome]) {
                        data.imagens.push(
                            pasta + req.files[nome][0].filename
                        );
                    }
                });

                // Inclui a lata na galeria
                if (req.files.imagemLata) {
                    data.imagens.unshift(
                        pasta + req.files.imagemLata[0].filename
                    );
                }
            }

            const produto = new Produto(data);
            const resultado = await produtoRepository.criar(produto);

            return res.status(201).json(resultado);
        } catch (error) {
            console.error(error);

            return res.status(error.status || 500).json({
                message: "Erro ao criar produto",
                errorMessage: error.message,
            });
        }
    },

    // Listar produtos com filtros
    listar: async (req, res) => {
        try {
            const produtos = await produtoRepository.listar({
                busca: req.query.busca || req.query.q,
                categoriaId: req.query.categoriaId,
                categoria: req.query.categoria,
                precoMin: req.query.precoMin,
                precoMax: req.query.precoMax,
                incluirInativos: req.query.todos === "true",
                apenasPromocoes: req.query.promocoes === "true",
            });

            return res.status(200).json(produtos);
        } catch (error) {
            console.error(error);

            return res.status(error.status || 500).json({
                message: "Erro ao listar produtos",
                errorMessage: error.message,
            });
        }
    },

    // Buscar produto por ID
    buscar: async (req, res) => {
        try {
            const produto = await produtoRepository.buscarPorId(req.params.id);

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado",
                });
            }

            return res.status(200).json(produto);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao buscar produto",
                errorMessage: error.message,
            });
        }
    },

    // Atualizar produto
    atualizar: async (req, res) => {
        try {
            const data = { ...req.body };
            const pasta = "/uploads/produtos/";

            // Receber novas fotos
            if (req.files) {
                if (req.files.imagemLata) {
                    data.imagem = pasta + req.files.imagemLata[0].filename;
                } else if (req.files.imagemPrincipal) {
                    data.imagem = pasta + req.files.imagemPrincipal[0].filename;
                }

                const nomes = [
                    "imagemCor",
                    "imagemSala",
                    "imagemQuarto",
                    "imagemCozinha",
                    "imagemQuintal",
                ];

                const imagens = [];

                if (req.files.imagemLata) {
                    imagens.push(data.imagem);
                }

                nomes.forEach((nome) => {
                    if (req.files[nome]) {
                        imagens.push(pasta + req.files[nome][0].filename);
                    }
                });

                if (imagens.length > 0) {
                    data.imagens = imagens;
                }
            }

            if (data.preco !== undefined) {
                data.preco = Number(data.preco);
            }

            if (data.precoPromocional !== undefined && data.precoPromocional !== "") {
                data.precoPromocional = Number(data.precoPromocional);
            }

            if (data.estoqueMinimo !== undefined) {
                data.estoqueMinimo = Number(data.estoqueMinimo);
            }

            const produto = await produtoRepository.atualizar(
                req.params.id,
                data
            );

            if (!produto) {
                return res.status(404).json({
                    message: "Produto não encontrado",
                });
            }

            return res.status(200).json(produto);
        } catch (error) {
            console.error(error);

            return res.status(error.status || 500).json({
                message: "Erro ao atualizar produto",
                errorMessage: error.message,
            });
        }
    },

    // Deletar produto
    deletar: async (req, res) => {
        try {
            const ok = await produtoRepository.deletar(req.params.id);

            if (!ok) {
                return res.status(404).json({
                    message: "Produto não encontrado",
                });
            }

            return res.status(200).json({
                message: "Produto desativado",
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Erro ao deletar produto",
                errorMessage: error.message,
            });
        }
    },
};

export default produtoController;