import produtoVolumetriaRepository from "../repositories/produtoVolumetriaRepository.js";
import { ProdutoVolumetria } from "../models/ProdutoVolumetria.js";

const produtoVolumetriaController = {
    criar: async (req, res) => {
        try {
            const data = { ...req.body, idProduto: Number(req.params.idProduto) };
            const volumetria = new ProdutoVolumetria(data);
            const resultado = await produtoVolumetriaRepository.criar(volumetria);
            return res.status(201).json(resultado);
        } catch (error) {
            console.error(error);
            return res.status(error.status || 500).json({
                message: error.status ? error.message : "Erro ao criar volumetria",
                errorMessage: error.message
            });
        }
    },

    buscar: async (req, res) => {
        try {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ message: "ID da volumetria inválido" });
            }
            const volumetria = await produtoVolumetriaRepository.buscarPorId(id);
            if (!volumetria) return res.status(404).json({ message: "Volumetria não encontrada" });
            return res.status(200).json(volumetria);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro ao buscar volumetria" });
        }
    },

    listarPorProduto: async (req, res) => {
        try {
            const idProduto = Number(req.params.idProduto);
            if (!Number.isInteger(idProduto) || idProduto <= 0) {
                return res.status(400).json({ message: "ID do produto inválido" });
            }
            const volumetrias = await produtoVolumetriaRepository.listarPorProduto(idProduto);
            return res.status(200).json(volumetrias);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Erro ao listar volumetrias" });
        }
    },

    calcular: async (req, res) => {
        try {
            const idProduto = Number(req.body.idProduto);
            const demãos = Number(req.body.demãos ?? 2);
            const areaInformada = req.body.areaM2;
            const altura = Number(req.body.altura);
            const largura = Number(req.body.largura);
            const quantidadeParedes = Number(req.body.quantidadeParedes ?? 1);
            const portas = Array.isArray(req.body.portas) ? req.body.portas : [];
            const janelas = Array.isArray(req.body.janelas) ? req.body.janelas : [];

            if (!Number.isInteger(idProduto) || idProduto <= 0) {
                return res.status(400).json({ message: "Produto inválido." });
            }
            if (!Number.isInteger(demãos) || demãos < 1 || demãos > 6) {
                return res.status(400).json({ message: "Informe de 1 a 6 demãos." });
            }

            let areaBruta;
            if (areaInformada !== undefined && areaInformada !== null && areaInformada !== "") {
                areaBruta = Number(areaInformada);
                if (!Number.isFinite(areaBruta) || areaBruta <= 0) {
                    return res.status(400).json({ message: "A metragem informada deve ser maior que zero." });
                }
            } else {
                if (
                    !Number.isFinite(altura) || altura <= 0 ||
                    !Number.isFinite(largura) || largura <= 0 ||
                    !Number.isInteger(quantidadeParedes) ||
                    quantidadeParedes < 1 || quantidadeParedes > 100
                ) {
                    return res.status(400).json({ message: "Informe altura, largura e quantidade de paredes válidas." });
                }
                areaBruta = altura * largura * quantidadeParedes;
            }

            const calcularAberturas = (lista, nome) => lista.reduce((total, item) => {
                const qtd = Number(item.quantidade ?? 0);
                const h = Number(item.altura ?? 0);
                const l = Number(item.largura ?? 0);
                if (
                    !Number.isInteger(qtd) || qtd < 0 || qtd > 100 ||
                    !Number.isFinite(h) || h < 0 ||
                    !Number.isFinite(l) || l < 0 ||
                    (qtd > 0 && (h <= 0 || l <= 0))
                ) {
                    throw Object.assign(new Error(`Informe quantidade, altura e largura válidas para ${nome}.`), { status: 400 });
                }
                return total + qtd * h * l;
            }, 0);

            const areaPortas = calcularAberturas(portas, "portas");
            const areaJanelas = calcularAberturas(janelas, "janelas");
            const areaLiquida = Math.max(0, areaBruta - areaPortas - areaJanelas);

            if (areaLiquida <= 0) {
                return res.status(400).json({
                    message: "A área das portas e janelas não pode ser igual ou maior que a área das paredes."
                });
            }

            const embalagens = await produtoVolumetriaRepository.listarParaCalculo(idProduto);
            if (!embalagens.length) {
                return res.status(404).json({ message: "Este produto não possui embalagens cadastradas." });
            }

            const semRendimento = embalagens.some((item) => !(Number(item.rendimento) > 0));
            const resultado = embalagens.map((item) => {
                const rendimento = Number(item.rendimento);
                const unidadesNecessarias = rendimento > 0
                    ? Math.ceil((areaLiquida * demãos) / rendimento)
                    : null;
                return {
                    id: item.id,
                    volume: Number(item.volume),
                    unidade: item.unidade,
                    preco: Number(item.preco),
                    estoque: Number(item.estoque),
                    rendimento: rendimento > 0 ? rendimento : null,
                    unidadesNecessarias,
                    litrosEstimados: unidadesNecessarias !== null && String(item.unidade).toUpperCase() === "L"
                        ? Number((Number(item.volume) * unidadesNecessarias).toFixed(2))
                        : null,
                    atendeEstoque: unidadesNecessarias !== null && unidadesNecessarias <= Number(item.estoque),
                    totalEstimado: unidadesNecessarias !== null
                        ? Number((unidadesNecessarias * Number(item.preco)).toFixed(2))
                        : null
                };
            });

            return res.status(200).json({
                idProduto,
                areaBruta: Number(areaBruta.toFixed(2)),
                areaPortas: Number(areaPortas.toFixed(2)),
                areaJanelas: Number(areaJanelas.toFixed(2)),
                areaLiquida: Number(areaLiquida.toFixed(2)),
                demãos,
                aviso: semRendimento
                    ? "Cadastre o rendimento em m² por embalagem por demão para todas as embalagens deste produto."
                    : null,
                embalagens: resultado
            });
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.status ? error.message : "Erro ao calcular a volumetria."
            });
        }
    },
};

export default produtoVolumetriaController;
