// representa um produto dentro de um pedido
export class ItemPedido {

    constructor(data) {

        // valida o pedido
        this.idPedido = Number(data.idPedido);

        if (
            !Number.isInteger(this.idPedido) ||
            this.idPedido <= 0
        ) {
            throw Object.assign(
                new Error("Pedido inválido"),
                { status: 400 }
            );
        }

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

        // valida a volumetria
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

        // valida a quantidade
        this.quantidade =
            Math.trunc(Number(data.quantidade));

        if (
            !Number.isInteger(this.quantidade) ||
            this.quantidade <= 0
        ) {
            throw Object.assign(
                new Error("Quantidade deve ser maior que zero"),
                { status: 400 }
            );
        }

        // valida o subtotal
        this.subtotal = Number(data.subtotal);

        if (
            !Number.isFinite(this.subtotal) ||
            this.subtotal < 0
        ) {
            throw Object.assign(
                new Error("Subtotal inválido"),
                { status: 400 }
            );
        }
    }
}
