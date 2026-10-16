import estoqueRepository from "../repositories/estoqueRepository.js";

const estoqueController = {

    // Altera a quantidade de estoque de um produto
    alterar: async (req, res) => {
        try {
            const resultado =
                await estoqueRepository.alterarEstoque(
                    req.params.id,
                    {
                        ...req.body,
                        idUsuario: req.user.id
                    }
                );

            return res.status(200).json(resultado);

        } catch (error) {
            console.error(error);

            // Retorna o status definido no erro ou 500 caso não tenha sido definido
            return res.status(
                error.status || 500
            ).json({
                message: "Erro ao alterar estoque",
                errorMessage: error.message
            });
        }
    },

    // Lista o histórico de movimentações do estoque
    listarMovimentacoes: async (req, res) => {
        try {

            // Busca as movimentações no repository 
            // Os filtros de produto e tipo são recebidos pelos parâmetros da URL
            const movimentacoes =
                await estoqueRepository.listarMovimentacoes({
                    idProduto: req.query.idProduto,
                    tipo: req.query.tipo
                });

            return res.status(200).json(
                movimentacoes
            );

        } catch (error) {
            console.error(error);

            return res.status(
                error.status || 500
            ).json({
                message:
                    "Erro ao consultar histórico de estoque",
                errorMessage: error.message
            });
        }
    }
};

export default estoqueController;