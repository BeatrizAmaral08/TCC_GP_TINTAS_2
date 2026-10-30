
export class ProdutoVolumetria {
    constructor(data = {}) {

    //validar produto

        this.idProduto = Number(data.idProduto);

        if (
            !Number.isInteger(this.idProduto) ||
            this.idProduto <= 0
        ) {
            throw Object.assign(
                new Error("Produto inválido."),
                { status: 400 }
            );
        }

        //validar volume

        this.volume = Number(data.volume);

        if (
            data.volume === undefined ||
            data.volume === null ||
            String(data.volume).trim() === "" ||
            !Number.isFinite(this.volume) ||
            this.volume <= 0
        ) {
            throw Object.assign(
                new Error("Volume inválido."),
                { status: 400 }
            );
        }

                //validar unidade   

        this.unidade = String(
            data.unidade ?? ""
        ).trim().toUpperCase();

        if (!["L", "ML"].includes(this.unidade)) {
            throw Object.assign(
                new Error("A unidade deve ser L ou ML."),
                { status: 400 }
            );
        }

     //validar preço

        this.preco = Number(data.preco);

        if (
            data.preco === undefined ||
            data.preco === null ||
            String(data.preco).trim() === "" ||
            !Number.isFinite(this.preco) ||
            this.preco < 0
        ) {
            throw Object.assign(
                new Error("Preço inválido."),
                { status: 400 }
            );
        }

        //validar estoque

        this.estoque = Number(data.estoque ?? 0);

        if (
            !Number.isInteger(this.estoque) ||
            this.estoque < 0
        ) {
            throw Object.assign(
                new Error(
                    "O estoque deve ser um número inteiro maior ou igual a zero."
                ),
                { status: 400 }
            );
        }

        //validar status

        const ativo = data.ativo ?? true;

        if (
            ativo === true ||
            ativo === 1 ||
            ativo === "1" ||
            ativo === "true"
        ) {
            this.ativo = true;

        } else if (
            ativo === false ||
            ativo === 0 ||
            ativo === "0" ||
            ativo === "false"
        ) {
            this.ativo = false;

        } else {
            throw Object.assign(
                new Error("Status da volumetria inválido."),
                { status: 400 }
            );
        }
    }
}
