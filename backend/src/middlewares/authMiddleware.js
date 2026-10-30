import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository.js";

//configutações

const PERFIS = ["comprador", "repositor", "dev", "admin"];

function getToken(req) {
    const header = req.headers.authorization || "";

    const [type, token, extra] = header.split(" ");

    if (type !== "Bearer" || !token || extra) {
        return null;
    }

    return token;
}

//autenticação obrigatoria

export async function authRequired(req, res, next) {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({
            message: "Token de autenticação não informado.",
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET não configurado.");

        return res.status(503).json({
            message: "Autenticação temporariamente indisponível.",
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"],
            }
        );
    } catch (error) {
        return res.status(401).json({
            message: "Token inválido ou expirado.",
        });
    }

    if (
        !decoded ||
        typeof decoded !== "object" ||
        !decoded.id
    ) {
        return res.status(401).json({
            message: "Token inválido.",
        });
    }

    try {
        // Consulta o usuário no banco
        const usuario = await authRepository.buscarPorId(
            decoded.id
        );

        if (!usuario) {
            return res.status(401).json({
                message: "Usuário não encontrado.",
            });
        }

        const perfil = String(
            usuario.perfil || ""
        ).trim().toLowerCase();

        if (!PERFIS.includes(perfil)) {
            return res.status(403).json({
                message: "Perfil de usuário não autorizado.",
            });
        }

        // Identificação do usuário autenticado
        req.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil,
            tipo: perfil,
        };

        return next();

    } catch (error) {
        console.error("Erro na autenticação:", error);

        if (
            ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"]
                .includes(error.code)
        ) {
            return res.status(503).json({
                message: "Banco de dados indisponível.",
            });
        }

        return res.status(500).json({
            message: "Erro interno ao autenticar usuário.",
        });
    }
}

//autenticação opicional

export function optionalAuth(req, res, next) {
    const token = getToken(req);

    if (!token) {
        if (req.headers.authorization) {
            return res.status(401).json({
                message: "Cabeçalho de autenticação inválido.",
            });
        }

        return next();
    }

    return authRequired(req, res, next);
}

//autorização por perfil

export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Usuário não autenticado.",
            });
        }

        const perfil = req.user.perfil;

        if (!allowedRoles.includes(perfil)) {
            return res.status(403).json({
                message: "Você não tem permissão para esta operação.",
            });
        }

        return next();
    };
}
