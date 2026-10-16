export class Categoria {

    constructor({
        id = null,
        nome,
        descricao,
        ativo = true
    }) {

        //validar nome
        if (
            !nome ||
            String(nome).trim().length < 3
        ) {
            throw Object.assign(
                new Error(
                    "Nome deve ter pelo menos 3 caracteres"
                ),
                { status: 400 }
            );
        }

        this.id = id;
        this.nome = String(nome).trim();
        this.descricao = descricao
            ? String(descricao).trim()
            : null;
        this.ativo = Boolean(ativo);
    }

}