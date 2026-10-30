import estoqueRepository from "../repositories/estoqueRepository.js";

// Trata os erros das operações de estoque
function tratarErro(error, res, mensagem) {
    console.error(mensagem, error);

    // Retorna mensagens de validação, incluindo estoque insuficiente
    if (
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status < 500
    ) {
        return res.status(error.status).json({
            message: error.message,
        });
    }

    // Trata problemas de conexão com o banco
    if (
        ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"]
            .includes(error.code)
    ) {
        return res.status(503).json({
            message: "Banco de dados indisponível.",
        });
    }

    return res.status(500).json({
        message: mensagem,
    });
}

const estoqueController = {

    // Altera manualmente o estoque de produtos e volumetrias
    alterar: async (req, res) => {
        try {
            const resultado =
                await estoqueRepository.alterarEstoque(
                    req.params.id,
                    {
                        ...req.body,
                        idUsuario: req.user.id,
                    }
                );

            return res.status(200).json(resultado);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao alterar estoque."
            );
        }
    },

    // Lista o histórico de movimentações do estoque
    listarMovimentacoes: async (req, res) => {
        try {
            // Recebe os filtros pela URL
            const movimentacoes =
                await estoqueRepository.listarMovimentacoes({
                    idProduto: req.query.idProduto,
                    tipo: req.query.tipo,
                });

            return res.status(200).json(movimentacoes);

        } catch (error) {
            return tratarErro(
                error,
                res,
                "Erro ao consultar histórico de estoque."
            );
        }
    },
};

export default estoqueController;