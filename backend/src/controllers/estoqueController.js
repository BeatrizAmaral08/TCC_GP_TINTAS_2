import estoqueRepository from "../repositories/estoqueRepository.js";

const estoqueController = {

    // alterar estoque
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

            return res.status(error.status || 500).json({
                message: "Erro ao alterar estoque",
                errorMessage: error.message
            });
        }
    }
};

export default estoqueController;