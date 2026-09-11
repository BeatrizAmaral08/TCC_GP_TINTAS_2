// representa uma movimentação de estoque de um produto
export class Estoque {

    constructor(data) {

        // valida o produto
        this.idProduto = Number(data.idProduto);

        if (
            !Number.isInteger(this.idProduto) ||
            this.idProduto <= 0
        ) {
            throw Object.assign(
                new Error("Produto inválido"),
                { status: 400 }
            );
        }

        // valida a operação
        this.operacao =
            String(data.operacao || "").trim().toLowerCase();

        const operacoesValidas = [
            "entrada",
            "saida",
            "definir"
        ];

        if (!operacoesValidas.includes(this.operacao)) {
            throw Object.assign(
                new Error(
                    "Operação deve ser entrada, saida ou definir"
                ),
                { status: 400 }
            );
        }

        // valida a quantidade
        this.quantidade =
            Number(data.quantidade);

        if (
            !Number.isInteger(this.quantidade) ||
            this.quantidade < 0
        ) {
            throw Object.assign(
                new Error("Quantidade inválida"),
                { status: 400 }
            );
        }

        // define o motivo da movimentação
        this.motivo =
            String(
                data.motivo ||
                "Ajuste pelo painel"
            ).trim();

        // identifica o usuário responsável
        this.idUsuario =
            data.idUsuario !== undefined &&
            data.idUsuario !== null
                ? Number(data.idUsuario)
                : null;

        if (
            this.idUsuario !== null &&
            (
                !Number.isInteger(this.idUsuario) ||
                this.idUsuario <= 0
            )
        ) {
            throw Object.assign(
                new Error("Usuário inválido"),
                { status: 400 }
            );
        }
    }
}