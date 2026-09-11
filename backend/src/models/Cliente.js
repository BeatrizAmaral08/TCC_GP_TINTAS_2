import {
    validarCPFBasico,
    validarEmail,
    somenteNumeros
} from "../utils/validators.js";

export class Cliente {

    constructor({
        id = null,
        nome,
        cpf,
        email,
        perfil = "comprador",
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

        //validar email
        if (!validarEmail(email)) {
            throw Object.assign(
                new Error("E-mail inválido"),
                { status: 400 }
            );
        }

        //validar cpf
        if (!validarCPFBasico(cpf)) {
            throw Object.assign(
                new Error(
                    "CPF deve possuir 11 números"
                ),
                { status: 400 }
            );
        }

        this.id = id;
        this.nome = String(nome).trim();
        this.cpf = somenteNumeros(cpf);
        this.email = String(email).trim().toLowerCase();
        this.perfil = perfil;
        this.ativo = Boolean(ativo);
    }

}