import { Router } from "express";
import pedidoController from "../controllers/pedidoController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const pedidoRoutes = Router();

// todas as rotas de pedido exigem autenticação
pedidoRoutes.use(authRequired);

// permite acesso somente ao administrador
const apenasAdmin = (req, res, next) => {

    if (req.user.perfil !== "admin") {
        return res.status(403).json({
            message: "Acesso permitido somente para administradores"
        });
    }

    next();
};

// checkout
pedidoRoutes.post("/checkout", pedidoController.checkout);

// lista os pedidos do cliente logado
pedidoRoutes.get("/", pedidoController.listar);

// acompanha o status dos pedidos do cliente
pedidoRoutes.get("/status", pedidoController.acompanharStatus);

// administrador visualiza todos os pedidos
pedidoRoutes.get("/admin/todos", apenasAdmin, pedidoController.listarTodos);

// administrador altera o status do pedido
pedidoRoutes.put("/admin/:id/status", apenasAdmin, pedidoController.alterarStatus);

// busca um pedido específico
pedidoRoutes.get("/:id", pedidoController.buscar);

export default pedidoRoutes;
