// representa o endereço de entrega de um cliente
export class Endereco {

    constructor(data) {

        // valida o CEP
        this.CEP = String(data.CEP || "").trim();

        if (!this.CEP) {
            throw Object.assign(
                new Error("CEP é obrigatório"),
                { status: 400 }
            );
        }

        // valida a rua
        this.rua = String(data.rua || "").trim();

        if (!this.rua) {
            throw Object.assign(
                new Error("Rua é obrigatória"),
                { status: 400 }
            );
        }

        // valida o número
        this.numero = Number(data.numero);

        if (
            !Number.isInteger(this.numero) ||
            this.numero <= 0
        ) {
            throw Object.assign(
                new Error("Número do endereço inválido"),
                { status: 400 }
            );
        }

        // complemento é opcional
        this.complemento =
            data.complemento
                ? String(data.complemento).trim()
                : null;

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
    }
}
