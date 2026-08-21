import categoriaRepository from "../repositories/categoriaRepository.js";

const categoriaController = {

    //listar categorias
    listar: async (req, res) => {

        try {
            const todos = req.query.todos === "true";

            const categorias =
                await categoriaRepository.listar(todos);
            return res.status(200).json(categorias);

        } catch (error) {

            console.error(error);
            return res.status(500).json({

                message: "Erro ao listar categorias",
                errorMessage: error.message
            });
        }
    },

    //buscar categoria por id
    buscar: async (req, res) => {

        try {

            const { id } = req.params;
            const categoria =
                await categoriaRepository.buscarPorId(id);

            if (!categoria) {

                return res.status(404).json({

                    message: "Categoria não encontrada"
                });
            }
            return res.status(200).json(categoria);

        } catch (error) {

            console.error(error);
            return res.status(500).json({

                message: "Erro ao buscar categoria",
                errorMessage: error.message
            });
        }
    },

    //criar categoria
    criar: async (req, res) => {

        try {

            const { nome, descricao } = req.body;

            //validar nome
            if (!nome) {

                return res.status(400).json({

                    message: "Nome é obrigatório"
                });
            }

            const categoria =
                await categoriaRepository.criar({

                    nome,
                    descricao

                });

            return res.status(201).json(categoria);

        } catch (error) {

            console.error(error);
            return res.status(500).json({

                message: "Erro ao criar categoria",
                errorMessage: error.message
            });
        }
    },

    //atualizar categoria
    atualizar: async (req, res) => {

        try {

            const { id } = req.params;
            const {
                nome,
                descricao
            } = req.body;

            const categoria =
                await categoriaRepository.atualizar(

                    id,

                    {
                        nome,
                        descricao
                    }
                );

            if (!categoria) {

                return res.status(404).json({

                    message: "Categoria não encontrada"
                });
            }

            return res.status(200).json(categoria);

        } catch (error) {

            console.error(error);
            return res.status(500).json({

                message: "Erro ao atualizar categoria",
                errorMessage: error.message
            });
        }
    },

    //deletar categoria
    deletar: async (req, res) => {

        try {

            const { id } = req.params;

            const resultado =
                await categoriaRepository.deletar(id);

            if (!resultado) {

                return res.status(404).json({

                    message: "Categoria não encontrada"
                });
            }

            return res.status(200).json({

                message: "Categoria desativada"
            });

        } catch (error) {

            console.error(error);
            return res.status(500).json({

                message: "Erro ao deletar categoria",
                errorMessage: error.message
            });
        }
    }
};


export default categoriaController;