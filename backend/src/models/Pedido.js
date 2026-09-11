export class Pedido {

    constructor(data) {

        // valida o cliente
        this.idCliente = Number(data.idCliente);

        if (
            !Number.isInteger(this.idCliente) ||
            this.idCliente <= 0
        ) {
            throw Object.assign(
                new Error("Cliente inválido"),
                { status: 400 }
            );
        }

        // define a data do pedido
        this.data =
            data.data ||
            new Date().toISOString().slice(0, 10);

        // define o status inicial da entrega
        this.statusEntrega =
            data.statusEntrega ||
            "Pendente";

        // valida o valor total
        this.valorTotal =
            Number(data.valorTotal);

        if (
            !Number.isFinite(this.valorTotal) ||
            this.valorTotal < 0
        ) {
            throw Object.assign(
                new Error("Valor total inválido"),
                { status: 400 }
            );
        }

        //valida a forma de pagamento escolhida
        this.formaPagamento =
            String(data.formaPagamento || "").trim();

        if (!this.formaPagamento) {
            throw Object.assign(
                new Error("A forma de pagamento é obrigatória"),
                { status: 400 }
            );
        }
    }
}
