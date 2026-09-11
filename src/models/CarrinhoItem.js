// representa um item dentro do carrinho de compra
export class CarrinhoItem {

    constructor(data) {

        //valida o id do carrinho
        this.idCarrinho = Number(data.idCarrinho);

        if (
            !Number.isInteger(this.idCarrinho) ||
            this.idCarrinho <= 0
        ) {
            throw Object.assign(
                new Error("Carrinho inválido"),
                { status: 400 }
            );
        }

        // valida o ID da volumetria escolhida
        this.idProdutoVolumetria =
            Number(data.idProdutoVolumetria);

        if (
            !Number.isInteger(this.idProdutoVolumetria) ||
            this.idProdutoVolumetria <= 0
        ) {
            throw Object.assign(
                new Error("Volumetria inválida"),
                { status: 400 }
            );
        }

        // valida a quantidade de produtos do carrinho
        this.quantidade = Math.trunc(
            Number(data.quantidade ?? 1)
        );

        if (
            !Number.isInteger(this.quantidade) ||
            this.quantidade <= 0
        ) {
            throw Object.assign(
                new Error("Quantidade deve ser maior que zero"),
                { status: 400 }
            );
        }
    }
}
