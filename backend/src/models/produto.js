import { numeroPositivo } from "../utils/validators.js";

export class Produto {

    constructor(data) {

        //validar nome
        if (
            !data.nome ||
            String(data.nome).trim().length < 2
        ) {
            throw Object.assign(
                new Error("Nome do produto é obrigatório"),
                { status: 400 }
            );
        }

        this.nome = String(data.nome).trim();
        this.descricao = data.descricao || null;

        this.idCategoria = Number(
            data.idCategoria ?? data.categoriaId
        );

        //validar categoria
        if (
            !Number.isInteger(this.idCategoria) ||
            this.idCategoria <= 0
        ) {
            throw Object.assign(
                new Error("Categoria inválida"),
                { status: 400 }
            );
        }

        this.marca = data.marca || null;

        //validar preço
        this.preco = numeroPositivo(
            data.preco,
            "Preço"
        );

        this.precoPromocional =
            data.precoPromocional === "" ||
            data.precoPromocional == null
                ? null
                : numeroPositivo(
                    data.precoPromocional,
                    "Preço promocional"
                );

        //validar preço promocional
        if (
            this.precoPromocional != null &&
            this.precoPromocional > this.preco
        ) {
            throw Object.assign(
                new Error(
                    "Preço promocional não pode ser maior que o preço normal"
                ),
                { status: 400 }
            );
        }

        this.desconto =
            this.precoPromocional == null
                ? Number(data.desconto || 0)
                : Math.round(
                    (1 - this.precoPromocional / this.preco) * 100
                );

        this.estoque = Math.trunc(
            numeroPositivo(
                data.estoque ?? 0,
                "Estoque"
            )
        );

        this.estoqueMinimo = Math.trunc(
            numeroPositivo(
                data.estoqueMinimo ?? 5,
                "Estoque mínimo"
            )
        );

        this.unidade = data.unidade || "UN";
        this.imagem = data.imagem || null;
        this.ativo =
            data.ativo === undefined
                ? true
                : Boolean(data.ativo);
    }

}