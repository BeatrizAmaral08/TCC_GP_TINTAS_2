export class ProdutoVolumetria {

    constructor(data) {

        // validar produto
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

        //validar  o volume
        this.volume = Number(data.volume);

        if (
            !Number.isFinite(this.volume) ||
            this.volume <= 0
        ) {
            throw Object.assign(
                new Error("Volume inválido"),
                { status: 400 }
            );
        }

        // validar a unidade
        this.unidade = String(
            data.unidade || ""
        ).trim().toUpperCase();

        if (!this.unidade) {
            throw Object.assign(
                new Error("Unidade do volume é obrigatória"),
                { status: 400 }
            );
        }

        //validar preço
        this.preco = Number(data.preco);

        if (
            !Number.isFinite(this.preco) ||
            this.preco < 0
        ) {
            throw Object.assign(
                new Error("Preço inválido"),
                { status: 400 }
            );
        }

        // validar estoque do produto
        this.estoque = Math.trunc(
            Number(data.estoque ?? 0)
        );

        if (
            !Number.isInteger(this.estoque) ||
            this.estoque < 0
        ) {
            throw Object.assign(
                new Error("Estoque inválido"),
                { status: 400 }
            );
        }

        // status do produto
        this.ativo =
            data.ativo === undefined
                ? true
                : Boolean(data.ativo);
    }
}
