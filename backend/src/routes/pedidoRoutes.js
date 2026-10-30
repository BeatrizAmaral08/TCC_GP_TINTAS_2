import { Router } from "express";
import pedidoController from "../controllers/pedidoController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";

const pedidoRoutes = Router();


// Todas as rotas exigem login
pedidoRoutes.use(authRequired);

//routes do cliente

// Finalizar compra
pedidoRoutes.post(
    "/checkout",
    requireRole("comprador"),
    pedidoController.checkout
);

// Listar pedidos do cliente logado
pedidoRoutes.get(
    "/",
    requireRole("comprador"),
    pedidoController.listar
);

// Acompanhar status dos pedidos
pedidoRoutes.get(
    "/status",
    requireRole("comprador"),
    pedidoController.acompanharStatus
);

//rotas administrativas

// Listar todos os pedidos da loja
pedidoRoutes.get(
    "/admin/todos",
    requireRole("repositor", "dev"),
    pedidoController.listarTodos
);

// Atualizar status de um pedido
pedidoRoutes.put(
    "/admin/:id/status",
    requireRole("repositor", "dev"),
    pedidoController.alterarStatus
);

//busca um pedido especifico
// Buscar detalhes de um pedido
pedidoRoutes.get(
    "/:id",
    pedidoController.buscar
);

export default pedidoRoutes;
