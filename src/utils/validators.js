//remover caracteres não numéricos
export const somenteNumeros = (value = "") =>
    String(value).replace(/\D/g, "");

//validar email
export function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        String(email || "").trim()
    );
}

//validar cpf
export function validarCPFBasico(cpf) {
    const value = somenteNumeros(cpf);

    return value.length === 11;
}

//validar cep
export function validarCEP(cep) {
    return somenteNumeros(cep).length === 8;
}

//validar número positivo
export function numeroPositivo(
    value,
    field = "valor",
    allowZero = true
) {
    const n = Number(value);

    if (
        !Number.isFinite(n) ||
        (allowZero ? n < 0 : n <= 0)
    ) {
        throw Object.assign(
            new Error(`${field} inválido`),
            { status: 400 }
        );
    }
    return n;
}

//normalizar perfil
export function normalizarPerfil(perfil) {
    const value = String(
        perfil || ""
    ).toLowerCase();

    if (
        ![
            "comprador",
            "repositor",
            "dev"
        ].includes(value)
    ) {
        throw Object.assign(
            new Error("Perfil inválido"),
            { status: 400 }
        );
    }
    return value;
}