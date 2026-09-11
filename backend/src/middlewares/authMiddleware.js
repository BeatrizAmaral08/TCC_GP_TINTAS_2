import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository.js";

export async function authRequired(req, res, next) {
    try {

        const header = req.headers.authorization || "";
        const [type, token] = header.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Token de autenticação não informado"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "gptintas-dev-secret"
        );

        const usuario = await authRepository.buscarPorId(decoded.id);

        if (!usuario) {
            return res.status(401).json({
                message: "Usuário inválido"
            });
        }

        req.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        next();

    } catch (error) {
        console.error("ERRO AUTH:", error);

        return res.status(401).json({
            message: "Token inválido ou expirado"
        });
    }
}

export function optionalAuth(req, res, next) {

    const header = req.headers.authorization || "";

    if (!header) {
        return next();
    }

    return authRequired(req, res, next);
}
