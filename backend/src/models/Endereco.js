export class Endereco {
  constructor(data = {}) {

   //validação de CPF

    this.CEP = String(data.CEP ?? "")
      .replace(/\D/g, "");

    if (!/^\d{8}$/.test(this.CEP)) {
      throw Object.assign(
        new Error("Informe um CEP válido com 8 dígitos."),
        { status: 400 }
      );
    }

    //validaçõa de rua
    this.rua = String(data.rua ?? "").trim();

    if (!this.rua) {
      throw Object.assign(
        new Error("Rua é obrigatória."),
        { status: 400 }
      );
    }

   //validação do numero

    const numeroInformado = data.numero;

    this.numero = Number(numeroInformado);

    if (
      numeroInformado === undefined ||
      numeroInformado === null ||
      String(numeroInformado).trim() === "" ||
      !Number.isSafeInteger(this.numero) ||
      this.numero <= 0
    ) {
      throw Object.assign(
        new Error("Número do endereço inválido."),
        { status: 400 }
      );
    }

    //complemeto opcional

    this.complemento = data.complemento
      ? String(data.complemento).trim()
      : null;

    //validaçõa do cliente
    this.idCliente = Number(data.idCliente);

    if (
      data.idCliente === undefined ||
      data.idCliente === null ||
      String(data.idCliente).trim() === "" ||
      !Number.isSafeInteger(this.idCliente) ||
      this.idCliente <= 0
    ) {
      throw Object.assign(
        new Error("Cliente inválido."),
        { status: 400 }
      );
    }
  }
}
