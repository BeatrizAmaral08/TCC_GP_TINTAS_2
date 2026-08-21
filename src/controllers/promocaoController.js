// import promocaoRepository from "../repositories/promocaoRepository.js";

// const promocaoController = {

//     //listar promoções
//     listar: async (req, res) => {
//         try {
//             const promocoes = await promocaoRepository.listar(
//                 req.query.todos === "true"
//             );

//             return res.status(200).json(promocoes);

//         } catch (error) {
//             console.error(error);

//             return res.status(500).json({
//                 message: "Erro ao listar promoções",
//                 errorMessage: error.message
//             });
//         }
//     },

//     //criar promoção
//     criar: async (req, res) => {
//         try {
//             const {
//                 idProduto,
//                 produtoId,
//                 desconto,
//                 inicio,
//                 fim
//             } = req.body;

//             //validar dados
//             if (
//                 !(idProduto || produtoId) ||
//                 !desconto ||
//                 !inicio ||
//                 !fim
//             ) {
//                 return res.status(400).json({
//                     message: "Produto, desconto, data inicial e data final são obrigatórios"
//                 });
//             }

//             const promocao =
//                 await promocaoRepository.criar({
//                     ...req.body,
//                     idProduto: idProduto || produtoId
//                 });

//             return res.status(201).json(promocao);

//         } catch (error) {
//             console.error(error);

//             return res.status(500).json({
//                 message: "Erro ao criar promoção",
//                 errorMessage: error.message
//             });
//         }
//     },

//     //atualizar promoção
//     atualizar: async (req, res) => {
//         try {
//             const promocao =
//                 await promocaoRepository.atualizar(
//                     req.params.id,
//                     {
//                         ...req.body,
//                         idProduto:
//                             req.body.idProduto ||
//                             req.body.produtoId
//                     }
//                 );

//             if (!promocao) {
//                 return res.status(404).json({
//                     message: "Promoção não encontrada"
//                 });
//             }

//             return res.status(200).json(promocao);

//         } catch (error) {
//             console.error(error);

//             return res.status(500).json({
//                 message: "Erro ao atualizar promoção",
//                 errorMessage: error.message
//             });
//         }
//     },

//     //deletar promoção
//     deletar: async (req, res) => {
//         try {
//             const ok =
//                 await promocaoRepository.deletar(
//                     req.params.id
//                 );

//             if (!ok) {
//                 return res.status(404).json({
//                     message: "Promoção não encontrada"
//                 });
//             }

//             return res.status(200).json({
//                 message: "Promoção desativada"
//             });

//         } catch (error) {
//             console.error(error);

//             return res.status(500).json({
//                 message: "Erro ao deletar promoção",
//                 errorMessage: error.message
//             });
//         }
//     }

// };

// export default promocaoController;