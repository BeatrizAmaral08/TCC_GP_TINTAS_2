export class Carrinho {
    //representa o carrinho de ompras do um cliente

    constructor(data) {

        // valida o id do cliente
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
    }
}
