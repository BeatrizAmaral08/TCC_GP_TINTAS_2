export class CarrinhoItem {
  constructor(data = {}) {

   //validar id do carrinho
    this.idCarrinho = Number(data.idCarrinho);

    if (
      data.idCarrinho == null ||
      String(data.idCarrinho).trim() === "" ||
      !Number.isSafeInteger(this.idCarrinho) ||
      this.idCarrinho <= 0
    ) {
      throw Object.assign(
        new Error("Carrinho inválido."),
        { status: 400 }
      );
    }

    //validar id da volumetria
    this.idProdutoVolumetria = Number(
      data.idProdutoVolumetria
    );

    if (
      data.idProdutoVolumetria == null ||
      String(data.idProdutoVolumetria).trim() === "" ||
      !Number.isSafeInteger(this.idProdutoVolumetria) ||
      this.idProdutoVolumetria <= 0
    ) {
      throw Object.assign(
        new Error("Volumetria inválida."),
        { status: 400 }
      );
    }

    //validar quantidade

    const valorQuantidade = data.quantidade ?? 1;

    this.quantidade = Number(valorQuantidade);

    if (
      String(valorQuantidade).trim() === "" ||
      !Number.isSafeInteger(this.quantidade) ||
      this.quantidade <= 0
    ) {
      throw Object.assign(
        new Error(
          "A quantidade deve ser um número inteiro maior que zero."
        ),
        { status: 400 }
      );
    }
  }
}
